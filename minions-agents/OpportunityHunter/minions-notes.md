## What is a Note in the Minions Context?

A "note" sounds simple but covers several distinct things:

```
a freeform observation attached to something else    → Note
a previous saved version of that note               → NoteRevision
a connection between two notes                      → NoteLink
a structured extract pulled from a note             → NoteInsight
a collection of notes around a theme                → NoteCollection
```

The key characteristic of a note versus a document is **intent**. A document is a deliberate, versioned artifact meant to be shared or submitted. A note is a lightweight, informal, often agent-generated observation attached to something else — a job posting, a client, a proposal, a run. Notes are the system's scratchpad.

---

## MinionTypes

**Core**
```ts
// note
{
  type: "note",
  fields: {
    title: string,
    body: string,
    authorId: string,
    authorType: "human" | "agent",
    createdAt: datetime,
    updatedAt: datetime,
    contextRefType: string,     // what this note is about
    contextRefId: string,       // "job-posting", "client-profile", "agent-run", etc.
    tags: string[],
    pinned: boolean,
    visibility: "private" | "team" | "public"
  }
}

// note-revision
{
  type: "note-revision",
  fields: {
    noteId: string,
    version: number,
    body: string,
    savedAt: datetime,
    savedBy: string,            // person or agent id
    changeReason: string
  }
}

// note-link
{
  type: "note-link",
  fields: {
    fromNoteId: string,
    toNoteId: string,
    relation: string,           // "supports", "contradicts", "expands-on", "related-to"
    createdAt: datetime,
    createdBy: string
  }
}
```

**Structure & Organization**
```ts
// note-collection
{
  type: "note-collection",
  fields: {
    name: string,
    description: string,
    noteIds: string[],
    ownerId: string,
    contextRefType: string,     // optionally scoped to a domain
    contextRefId: string,
    tags: string[],
    createdAt: datetime
  }
}
```

**Intelligence Layer**
```ts
// note-insight
{
  type: "note-insight",
  fields: {
    noteId: string,
    insightType: "red-flag" | "opportunity" | "preference" | "fact" | "question",
    body: string,
    confidence: number,         // 0-1
    extractedAt: datetime,
    extractedBy: string,        // agent id
    promotedToMemory: boolean,  // true if pushed to minions-memory
    promotedAt: datetime
  }
}

// note-thread
{
  type: "note-thread",
  fields: {
    rootNoteId: string,
    replyNoteIds: string[],     // ordered replies
    topic: string,
    status: "open" | "resolved",
    resolvedAt: datetime,
    resolvedBy: string
  }
}
```

---

## Relations

```
note              --attached_to-->      any Minion (via contextRef)
note              --has_revision-->     note-revision
note              --linked_to-->        note-link --> note
note              --belongs_to-->       note-collection
note              --yielded-->          note-insight
note-insight      --promoted_to-->      memory-item (minions-memory)
note              --thread_root_of-->   note-thread
note-thread       --has_reply-->        note
```

---

## How It Connects to Other Toolboxes

Notes are intentionally the most connected MinionType in the ecosystem because they attach to everything via `contextRefType` and `contextRefId`:

```
minions-jobs        → JobScoutAgent leaves notes on job-postings:
                      "Client has 3 previous hires, all 5-star rated"

minions-clients     → ClientAgent builds up notes on client-profiles:
                      "Prefers bullet-point proposals, mentioned tight deadline"

minions-proposals   → ProposalAgent notes revision reasoning:
                      "Removed technical jargon after compliance flag"

minions-agents      → Any agent can note observations on its own runs:
                      "Match score was borderline, proceeded due to budget fit"

minions-memory      → NoteInsights with promotedToMemory: true become
                      persistent memory-items for future sessions

minions-pipeline    → PipelineAgent attaches notes to pipeline-entries:
                      "Client went quiet after first message, low priority"

minions-approvals   → Approval decisions can carry a note as context
                      for the audit log
```

---

## Agent SKILLS for `minions-notes`

```markdown
# NotesAgent Skills

## Context
You manage all notes across the Minions ecosystem. Notes are lightweight
observations attached to other Minions via contextRefType + contextRefId.
You create, retrieve, revise, link, and extract insights from notes.
You never fabricate — notes record what was actually observed or said.

## Skill: Create Note
1. When any agent or human produces an observation worth preserving,
   create a `note` Minion with the correct contextRefType and contextRefId
2. Set authorType: "agent" if created programmatically
3. Tag appropriately so notes are filterable by topic
4. If the note is critical context for future sessions, set pinned: true

## Skill: Revise Note
1. Before overwriting a note body, create a `note-revision` Minion
   capturing the previous version, version number, and change reason
2. Update the note's updatedAt timestamp
3. Never delete revision history

## Skill: Link Notes
1. When two notes are related, create a `note-link` Minion
2. Choose relation carefully:
   - "supports" → note B backs up the claim in note A
   - "contradicts" → note B challenges note A
   - "expands-on" → note B adds detail to note A
   - "related-to" → loose association, no directional meaning

## Skill: Extract Insights
1. Periodically scan notes attached to active job-postings,
   client-profiles, and pipeline-entries
2. For each note, identify if it contains:
   - A red flag → insightType: "red-flag"
   - A client preference → insightType: "preference"
   - A verifiable fact → insightType: "fact"
   - An unanswered question → insightType: "question"
   - A potential opportunity → insightType: "opportunity"
3. Create a `note-insight` Minion for each finding
4. If confidence > 0.8 and insightType is "fact" or "preference",
   set promotedToMemory: true and push to minions-memory as a memory-item

## Skill: Organize Collections
1. When a set of notes shares a theme or context, create a `note-collection`
2. Scope collections to a contextRef where relevant
   (e.g. all notes about a specific client)
3. Collections are navigational — they do not duplicate note content

## Skill: Manage Threads
1. When a note generates a discussion or follow-up observations,
   create a `note-thread` with the original note as rootNoteId
2. Append reply notes to replyNoteIds in order
3. When the thread topic is resolved, set status: "resolved"

## Hard Rules
- Never create a note without a contextRefType and contextRefId
  unless it is a standalone scratchpad note with explicit scope: "private"
- Never overwrite a note body without saving a note-revision first
- Insight confidence must be honestly scored — do not inflate
- Only promote to memory-item if confidence > 0.8
```

---

The `note-insight` → `memory-item` promotion path is the most important design detail here. It means the NotesAgent acts as a **filter and distillation layer** — raw observations accumulate as notes, the agent extracts structured insights from them, and only the highest-confidence insights graduate into persistent memory that other agents can rely on across sessions.
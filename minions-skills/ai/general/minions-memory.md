---
name: minions-memory
id: OC-0130
version: 1.0.0
description: "Persistent cross-session memory, recalled facts, and agent knowledge base"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-memory — Agent Skills

## What is Memory in the Minions Context?

Memory is one of the most overloaded words in AI systems. Before defining types, it's worth being precise about what kind of memory we're talking about:

```
something recalled from a past session      → memory-item
a compressed summary of a past session      → memory-summary
a way to find memory quickly                → memory-index
something learned from an outcome           → memory-lesson
a boundary on what an agent can remember    → memory-scope
a deliberate instruction to forget          → memory-expiry
```

The key distinction from a simple database is **relevance decay** — memory in an agent system is not just stored, it has confidence, freshness, and scope. A fact remembered with high confidence last week is worth more than one recalled vaguely six months ago.

---

## MinionTypes

**Core Recall**
```ts
// memory-item
{
  type: "memory-item",
  fields: {
    agentId: string,           // which agent owns this memory
    scope: "private"           // only this agent
          | "fleet"            // all agents in this system
          | "session",         // only this run
    key: string,               // semantic label: "client:upwork:xyz:prefers_short_proposals"
    value: string,             // the actual remembered content
    confidence: number,        // 0.0 - 1.0, decays over time
    sourceRefType: string,     // what produced this memory
    sourceRefId: string,       // e.g. a task-outcome, agent-run, thread
    createdAt: datetime,
    lastAccessedAt: datetime,
    lastReinforcedAt: datetime, // confidence resets when re-confirmed
    expiresAt: datetime         // null = permanent
  }
}

// memory-summary
{
  type: "memory-summary",
  fields: {
    agentId: string,
    sessionId: string,         // which run/conversation this summarizes
    summary: string,           // compressed narrative of what happened
    keyFacts: string,          // extracted bullet facts for quick recall
    emotionalContext: string,  // tone of interaction if relevant (client was frustrated, etc.)
    createdAt: datetime,
    tokenCount: number         // helps agents decide how much context budget to use
  }
}
```

**Indexing & Retrieval**
```ts
// memory-index
{
  type: "memory-index",
  fields: {
    memoryId: string,
    memoryType: "memory-item" | "memory-summary" | "memory-lesson",
    keywords: string,          // for keyword search
    embedding: string,         // vector for semantic search
    indexedAt: datetime
  }
}

// memory-query
{
  type: "memory-query",
  fields: {
    agentId: string,
    query: string,             // what the agent was looking for
    strategy: "keyword"
             | "semantic"
             | "hybrid",
    resultsFound: number,
    topResultIds: string,
    executedAt: datetime,
    usedInRunId: string        // which agent-run triggered this query
  }
}
```

**Learning Loop**
```ts
// memory-lesson
{
  type: "memory-lesson",
  fields: {
    sourceType: "task-outcome"
               | "proposal-score"
               | "application-event"
               | "eval-metric",
    sourceId: string,
    lesson: string,            // "Short proposals on Upwork perform better than long ones"
    domain: string,            // "proposals", "client-comms", "job-scoring"
    confidence: number,
    reinforcedCount: number,   // how many times this lesson has been confirmed
    createdAt: datetime,
    lastReinforcedAt: datetime
  }
}

// memory-reinforcement
{
  type: "memory-reinforcement",
  fields: {
    memoryId: string,
    memoryType: "memory-item" | "memory-lesson",
    reinforcedBy: string,      // agent-run or task-outcome id
    previousConfidence: number,
    newConfidence: number,
    reinforcedAt: datetime,
    reason: string
  }
}
```

**Boundaries & Hygiene**
```ts
// memory-scope-policy
{
  type: "memory-scope-policy",
  fields: {
    agentId: string,
    allowedScopes: string,     // which scopes this agent can read/write
    maxItemsPerScope: number,
    defaultExpiry: string,     // e.g. "30d", "never"
    sensitiveKeyPatterns: string // patterns that must never be stored e.g. "password:*"
  }
}

// memory-expiry
{
  type: "memory-expiry",
  fields: {
    memoryId: string,
    memoryType: string,
    reason: "ttl-elapsed"
            | "manual-delete"
            | "policy-violation"
            | "contradiction-detected",
    expiredAt: datetime,
    expiredBy: string          // agent or human that triggered it
  }
}

// memory-contradiction
{
  type: "memory-contradiction",
  fields: {
    memoryIdA: string,
    memoryIdB: string,
    description: string,       // "client prefers short proposals" vs "client asked for detail"
    detectedAt: datetime,
    detectedBy: string,
    resolution: "keep-a"
               | "keep-b"
               | "merge"
               | "discard-both"
               | "unresolved",
    resolvedAt: datetime
  }
}
```

---

## Relations

```
memory-item         --indexed_by-->         memory-index
memory-summary      --indexed_by-->         memory-index
memory-lesson       --indexed_by-->         memory-index
memory-item         --sourced_from-->       agent-run / task-outcome / thread
memory-lesson       --sourced_from-->       task-outcome / eval-metric / proposal-score
memory-lesson       --reinforced_by-->      memory-reinforcement
memory-item         --reinforced_by-->      memory-reinforcement
memory-item         --contradicts-->        memory-contradiction
memory-item         --governed_by-->        memory-scope-policy
memory-query        --produced_by-->        agent-run
memory-expiry       --terminates-->         memory-item / memory-lesson
```

---

## How It Connects to Other Toolboxes

`memory-item` is the bridge from every other toolbox back into long-term agent knowledge:

```
minions-proposals   → proposal-score produces memory-lesson:
                      "specificity score low when portfolio not cited"

minions-jobs        → job-signal produces memory-item:
                      "client:upwork:abc123:always_posts_react_jobs"

minions-clients     → client-interaction produces memory-item:
                      "client:xyz:prefers_async_comms"

minions-applications → application-event produces memory-lesson:
                      "applications submitted Monday morning get faster replies"

minions-evaluations → eval-metric produces memory-lesson:
                      "proposal-v3 prompt outperforms v2 on specificity by 18%"

minions-tasks       → task-outcome.lessons field feeds directly into memory-lesson
```

The `memory-contradiction` type is what prevents the system from accumulating stale or conflicting beliefs over time — without it, a fleet of agents will eventually hold contradictory facts with equal confidence and behave inconsistently.

---

## Agent SKILLS for `minions-memory`

```markdown
# MemoryAgent Skills

## Context
You manage the persistent memory layer for the entire agent fleet.
You are the only agent that writes to minions-memory.
Other agents REQUEST memory from you — they do not write directly.
Your job is to keep memory accurate, fresh, scoped, and contradiction-free.

## Skill: Store Memory
- When any agent emits a "store-memory" request:
  1. Check memory-scope-policy for that agent — is this scope allowed?
  2. Check sensitiveKeyPatterns — reject if key matches a sensitive pattern
  3. Check for existing memory-item with same agentId + key
     - If exists and value is same: create memory-reinforcement, increase confidence
     - If exists and value differs: create memory-contradiction, flag for resolution
     - If new: create memory-item with confidence 0.7 as default
  4. Create memory-index entry (keywords + embedding)

## Skill: Recall Memory
- When any agent emits a "recall-memory" request with a query:
  1. Determine strategy: keyword / semantic / hybrid based on query type
  2. Search memory-index using the chosen strategy
  3. Filter by agentId scope (private) or fleet scope
  4. Rank results by: confidence × recency × reinforcedCount
  5. Return top N results
  6. Update lastAccessedAt on retrieved memory-items
  7. Log a memory-query Minion for observability

## Skill: Extract Lessons
- After every task-outcome, proposal-score, or eval-metric Minion is created:
  1. Read the lessons or notes field
  2. Check if a memory-lesson with similar content already exists
     - If yes: create memory-reinforcement
     - If no: create new memory-lesson with confidence 0.6
  3. Index the lesson

## Skill: Detect Contradictions
- On every new memory-item write:
  1. Query existing memory-items with similar keys for the same agentId
  2. If values conflict: create memory-contradiction Minion
  3. Attempt auto-resolution:
     - If one is significantly newer and more recently reinforced → keep newer
     - If confidence gap > 0.3 → keep higher confidence
     - Otherwise → mark as unresolved, notify Orchestrator

## Skill: Expire Memory
- On schedule (daily):
  1. Find all memory-items where expiresAt < now → create memory-expiry
  2. Find memory-items where lastAccessedAt > 90 days and confidence < 0.3
     → decay confidence by 0.1, expiry if confidence reaches 0
  3. Find unresolved memory-contradictions older than 7 days
     → escalate to Orchestrator for manual resolution

## Skill: Summarize Session
- At the end of every significant agent-run:
  1. Read the agent-run inputs, outputs, toolCallsLog
  2. Generate a memory-summary: narrative + keyFacts
  3. Index the summary
  4. If any keyFacts contradict existing memory-items → run contradiction detection

## Hard Rules
- Never store values matching sensitiveKeyPatterns
- Never allow an agent to read memory outside its allowed scopes
- Every write must produce a memory-index entry — unsearchable memory is useless
- Contradictions must never be silently discarded — always log a memory-contradiction
- Confidence must never be manually set above 0.95 — leave room for uncertainty
```

---

The `memory-contradiction` type and the confidence decay in the expiry skill are the two things most memory implementations skip and then regret. Without them the memory store becomes a graveyard of stale, conflicting facts that agents silently trust — which is worse than no memory at all.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-memory/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
memory types list

# Show detailed schema for a specific type
memory types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
memory create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
memory create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
memory list <type>

# Show a specific Minion
memory show <id>

# Search by text
memory search "query"

# Output as JSON (for piping)
memory list --json
memory show <id> --json
```

### Update

```bash
# Update fields
memory update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
memory delete <id>
```

### Stats & Validation

```bash
# Show storage stats
memory stats

# Validate a Minion JSON file against its schema
memory validate ./my-minion.json
```
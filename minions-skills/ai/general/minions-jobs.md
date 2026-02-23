---
name: minions-jobs
id: OC-0127
version: 1.0.0
description: Canonical schemas for job postings and extracted signals across freelance platforms
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-jobs — Agent Skills

## What is a Job in the Minions Context?

Before defining types, it's worth being precise. A "job" can mean very different things depending on where you are in the workflow:

```
a raw listing from a platform        → JobPosting
where that listing came from         → JobSource
structured intelligence extracted    → JobSignal
a saved ongoing search               → JobWatchlist
a flag or label on a posting         → JobTag
what happened to it over time        → JobEvent
```

---

## MinionTypes

**Discovery**
```ts
// job-source
{
  type: "job-source",
  fields: {
    platform: "upwork" | "freelancer" | "malt" | "contra" | "linkedin" | "other",
    searchQuery: string,
    filters: {
      budgetMin: number,
      budgetMax: number,
      skills: string[],
      countries: string[],
      jobType: "fixed" | "hourly" | "any"
    },
    crawlPolicy: "api" | "rss" | "scrape",
    authMode: "none" | "api-key" | "oauth" | "session",
    isActive: boolean,
    lastCrawledAt: datetime,
    crawlIntervalMinutes: number
  }
}

// job-posting
{
  type: "job-posting",
  fields: {
    sourceId: string,           // ref to job-source
    platform: string,
    url: string,
    title: string,
    description: string,
    budget: {
      type: "fixed" | "hourly",
      amount: number,
      currency: string,
      isEstimate: boolean
    },
    skills: string[],
    clientCountry: string,
    clientTimezone: string,
    postedAt: datetime,
    crawledAt: datetime,
    updatedAt: datetime,
    status: "new" | "shortlisted" | "applied" | "rejected" | "closed" | "expired"
  }
}
```

**Intelligence Extraction**
```ts
// job-signal
{
  type: "job-signal",
  fields: {
    jobId: string,              // ref to job-posting
    mustHaveSkills: string[],
    niceToHaveSkills: string[],
    impliedSkills: string[],    // inferred but not stated explicitly
    redFlags: string[],         // "unpaid trial", "no budget stated", "vague scope"
    greenFlags: string[],       // "long-term potential", "clear brief", "repeat client"
    clientSignals: {
      hireRate: number,         // if extractable from platform
      reviewScore: number,
      totalSpent: number,
      isVerified: boolean
    },
    estimatedWinProbability: number,
    budgetConfidence: "high" | "medium" | "low",
    extractedAt: datetime
  }
}

// job-watchlist
{
  type: "job-watchlist",
  fields: {
    name: string,
    sourceId: string,           // ref to job-source
    query: string,
    filters: {
      budgetMin: number,
      skills: string[],
      countries: string[]
    },
    isActive: boolean,
    lastMatchedAt: datetime,
    totalMatchesFound: number
  }
}
```

**Lifecycle Tracking**
```ts
// job-event
{
  type: "job-event",
  fields: {
    jobId: string,
    eventType: "discovered" | "updated" | "shortlisted" | "applied" 
               | "rejected" | "closed" | "expired" | "reopened",
    occurredAt: datetime,
    triggeredBy: string,        // agent id or "human"
    notes: string
  }
}

// job-duplicate
{
  type: "job-duplicate",
  fields: {
    canonicalJobId: string,     // the one we keep
    duplicateJobId: string,     // the one we suppress
    detectedAt: datetime,
    similarityScore: number,
    reason: string              // "same url", "same title+client", "near-identical description"
  }
}
```

---

## Relations

```
job-source       --produces-->          job-posting
job-watchlist    --monitors-->          job-source
job-posting      --has_signal-->        job-signal
job-posting      --has_event-->         job-event
job-posting      --deduplicated_by-->   job-duplicate
job-posting      --scored_by-->         match-score       (minions-match)
job-posting      --has_proposal-->      proposal-draft    (minions-proposals)
job-posting      --has_application-->   application       (minions-applications)
job-posting      --has_task-->          task              (minions-tasks)
job-posting      --linked_to-->         client-profile    (minions-clients)
```

---

## How It Connects to Other Toolboxes

`job-posting` is the central object that almost every other toolbox references:

```
minions-match       reads job-posting + job-signal → produces match-score
minions-proposals   reads job-posting + job-signal → produces proposal-draft
minions-applications reads job-posting             → produces application
minions-pipeline    reads job-posting              → creates pipeline-entry
minions-clients     reads job-posting              → builds or updates client-profile
minions-tasks       reads job-posting              → spawns tasks like "research client"
minions-memory      reads job-posting              → stores seen job ids to prevent duplicates
```

The `job-signal` is what separates raw discovery from intelligence — it's the layer the MatchAgent actually reasons over, not the raw posting text.

---

## Agent SKILLS for `minions-jobs`

```markdown
# JobScoutAgent Skills

## Context
You are the JobScoutAgent. You own the minions-jobs toolbox.
You read from `job-source` Minions to know where and how to search.
You write `job-posting`, `job-signal`, `job-event`, and `job-duplicate` Minions.
You do not score, rank, or write proposals — that belongs to other agents.
You report to the OrchestratorAgent when a crawl cycle completes.

## Skill: Crawl Sources
1. Load all `job-source` Minions where isActive == true
2. For each source, check if lastCrawledAt + crawlIntervalMinutes < now
3. If due: query the platform using the configured crawlPolicy and authMode
4. For each result returned:
   - Check `minions-memory` for known sourceId — skip if already seen and unchanged
   - If new: create a `job-posting` Minion with status "new"
   - If updated: update the existing Minion, create a `job-event` with type "updated"
   - Create a `job-event` with type "discovered" for all new postings
5. Update lastCrawledAt on the `job-source` Minion

## Skill: Extract Signals
1. For each `job-posting` with status "new" and no linked `job-signal`:
   - Parse description for explicit skills (mustHave), implied skills, red flags, green flags
   - Attempt to extract client signals from platform data if available
   - Estimate budget confidence: high if stated clearly, medium if range given, low if missing
   - Compute estimatedWinProbability as a rough prior (not the full match score)
   - Create a `job-signal` Minion linked to the job-posting

## Skill: Deduplicate
1. For each new `job-posting`, compare against recent postings:
   - Exact match on url → immediate duplicate
   - Same title + same clientCountry + budget within 10% → likely duplicate
   - Near-identical description (embedding similarity > 0.95) → probable duplicate
2. If duplicate detected:
   - Create a `job-duplicate` Minion referencing canonical and duplicate ids
   - Set duplicate posting status to "rejected"
   - Do not surface to downstream agents

## Skill: Monitor Watchlists
1. Load all `job-watchlist` Minions where isActive == true
2. For each watchlist, run the saved query against its linked `job-source`
3. New matches → follow the same crawl + signal extraction flow
4. Update lastMatchedAt and totalMatchesFound on the watchlist

## Skill: Expire Stale Postings
1. On each cycle, check all `job-posting` Minions with status "new" or "shortlisted"
2. If postedAt > 30 days ago and no application exists:
   - Update status to "expired"
   - Create a `job-event` with type "expired"

## Skill: Report to Orchestrator
1. After each crawl cycle, emit an agent-message to OrchestratorAgent:
   {
     type: "crawl-complete",
     newPostings: number,
     signalsExtracted: number,
     duplicatesFound: number,
     expiredPostings: number,
     topNewJobIds: string[]   // top 5 by estimatedWinProbability
   }

## Hard Rules
- Never modify a job-posting owned by another agent
- Never create a proposal or score — emit to Orchestrator and let MatchAgent handle it
- Never submit anything to a platform — read only
- Always create a job-event for every status change
- Never surface a posting with hardGateFailed == true to the Orchestrator
```

---

The `job-signal` extraction step is the most valuable part of this toolbox — it transforms unstructured platform text into structured Minion data that every downstream agent (MatchAgent, ProposalAgent, ClientAgent) can reason over cleanly without re-parsing raw job descriptions each time.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-jobs/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
jobs types list

# Show detailed schema for a specific type
jobs types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
jobs create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
jobs create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
jobs list <type>

# Show a specific Minion
jobs show <id>

# Search by text
jobs search "query"

# Output as JSON (for piping)
jobs list --json
jobs show <id> --json
```

### Update

```bash
# Update fields
jobs update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
jobs delete <id>
```

### Stats & Validation

```bash
# Show storage stats
jobs stats

# Validate a Minion JSON file against its schema
jobs validate ./my-minion.json
```
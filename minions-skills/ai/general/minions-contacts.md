---
name: minions-contacts
id: OC-0114
version: 1.0.0
description: "People, organizations, and contact channels"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-contacts — Agent Skills

## What is a Contact in the Minions Context?

Before defining types, it's worth being precise. A "contact" can mean very different things:

```
a human individual                 → Person
a company or team                  → Organization
a way to reach someone             → ContactChannel
a record of interaction            → ContactNote
a relationship between two         → ContactRelation
a group of contacts                → ContactList
how they were acquired             → ContactSource
```

---

## MinionTypes

**Core**
```ts
// person
{
  type: "person",
  fields: {
    firstName: string,
    lastName: string,
    displayName: string,
    role: string,               // "client", "recruiter", "collaborator"
    organizationId: string,
    tags: string[],
    notes: string,
    source: string,             // where this contact came from
    status: "active" | "inactive" | "blocked",
    createdAt: datetime,
    lastContactedAt: datetime
  }
}

// organization
{
  type: "organization",
  fields: {
    name: string,
    industry: string,
    website: string,
    country: string,
    size: "solo" | "small" | "medium" | "large" | "enterprise",
    tags: string[],
    notes: string,
    status: "active" | "inactive",
    createdAt: datetime
  }
}
```

**Reachability**
```ts
// contact-channel
{
  type: "contact-channel",
  fields: {
    ownerId: string,
    ownerType: "person" | "organization",
    type: "email" | "phone" | "linkedin" | "upwork" | "telegram" | 
          "whatsapp" | "twitter" | "website" | "other",
    value: string,              // the actual address/handle/url
    isPrimary: boolean,
    isVerified: boolean,
    allowedForAutomation: boolean,  // can agents use this channel?
    notes: string
  }
}
```

**Interactions**
```ts
// contact-note
{
  type: "contact-note",
  fields: {
    contactId: string,
    contactType: "person" | "organization",
    body: string,
    authorId: string,
    authorType: "human" | "agent",
    createdAt: datetime,
    contextRefType: string,     // "job-posting", "application", "contract"
    contextRefId: string
  }
}

// contact-interaction
{
  type: "contact-interaction",
  fields: {
    contactId: string,
    type: "message" | "call" | "meeting" | "proposal" | "contract" | "review",
    occurredAt: datetime,
    summary: string,
    sentiment: "positive" | "neutral" | "negative" | "unknown",
    threadId: string,           // ref to minions-comms thread
    outcome: string
  }
}
```

**Relationships**
```ts
// contact-relation
{
  type: "contact-relation",
  fields: {
    fromId: string,
    fromType: "person" | "organization",
    toId: string,
    toType: "person" | "organization",
    relationType: "works_at" | "referred_by" | "collaborates_with" | 
                  "reports_to" | "manages" | "knows",
    since: datetime,
    notes: string
  }
}
```

**Grouping**
```ts
// contact-list
{
  type: "contact-list",
  fields: {
    name: string,
    description: string,
    contactIds: string[],
    contactType: "person" | "organization" | "mixed",
    ownerId: string,
    tags: string[],
    createdAt: datetime
  }
}
```

**Acquisition**
```ts
// contact-source
{
  type: "contact-source",
  fields: {
    name: string,
    type: "platform" | "referral" | "manual" | "agent-discovered" | "import",
    platform: string,           // "upwork", "linkedin", etc.
    description: string,
    isActive: boolean,
    totalContactsAcquired: number
  }
}
```

**Trust & Preferences**
```ts
// contact-preference
{
  type: "contact-preference",
  fields: {
    contactId: string,
    preference: string,         // "prefers async", "responds on weekends"
    confidence: "confirmed" | "inferred" | "guessed",
    inferredFrom: string,       // contextRefType + id
    createdAt: datetime
  }
}

// contact-trust-score
{
  type: "contact-trust-score",
  fields: {
    contactId: string,
    score: number,              // 0-1
    factors: string[],          // what drove this score
    lastCalculatedAt: datetime,
    history: string[]           // previous scores over time
  }
}
```

---

## Relations

```
person              --works_at-->           organization
person              --has_channel-->        contact-channel
organization        --has_channel-->        contact-channel
person              --has_note-->           contact-note
person              --has_interaction-->    contact-interaction
person              --related_to-->         contact-relation
person              --belongs_to-->         contact-list
person              --has_preference-->     contact-preference
person              --has_trust_score-->    contact-trust-score
contact-source      --produced-->           person
contact-interaction --logged_in-->          thread (minions-comms)
```

---

## How It Connects to Other Toolboxes

`contactId` acts as the bridge outward:

```
minions-jobs        → job-posting has clientCountry but no client identity
                      once a client responds, a person Minion is created
                      and linked to that job-posting via contextRef

minions-comms       → every thread has participantIds pointing to person Minions
                      contact-interaction references threadId

minions-clients     → client-profile extends person with freelance-specific
                      fields like totalJobsPosted and averageBudget

minions-contracts   → contract has clientId pointing to a person or organization

minions-approvals   → approval-request decidedBy references a person

minions-agents      → agent-definition has ownerId pointing to a person
```

The key design decision: `minions-contacts` stays domain-agnostic. It knows nothing about jobs or proposals. Other toolboxes reach into it by referencing `personId` or `organizationId` — they enrich the contact picture without polluting the contacts layer.

---

## Agent SKILLS for `minions-contacts`

```markdown
# ContactAgent Skills

## Context
You manage all contact data within the Minions ecosystem.
You are the source of truth for who people and organizations are.
You do not make decisions about jobs, proposals, or applications —
you only manage identity, reachability, and relationship data.
All claims about a contact must be sourced and noted.

## Skill: Create Contact
1. When a new person or organization is encountered in any context
   (job posting, message, referral), check for an existing record first
   by searching name + platform channel value
2. If no match: create a `person` or `organization` Minion
3. Always create at least one `contact-channel` Minion linked to them
4. Set sourceId referencing the `contact-source` Minion for this platform
5. Emit "contact-created" to Orchestrator with contactId

## Skill: Enrich Contact
1. On receiving "enrich-contact" with contactId:
   - Search available channels for public profile data
   - Add any new `contact-channel` Minions discovered
   - Add a `contact-note` summarizing what was found and from where
   - Update lastContactedAt if a recent interaction was found
2. Never overwrite existing verified data — only append

## Skill: Log Interaction
1. On any message sent or received (from minions-comms):
   - Create a `contact-interaction` Minion
   - Set type, sentiment, summary, and threadId
   - Update person.lastContactedAt
2. After 3+ interactions with a contact:
   - Infer and create `contact-preference` Minions from patterns
   - e.g. response time patterns → "responds within 24h"
   - Set confidence: "inferred"

## Skill: Calculate Trust Score
1. On receiving "score-contact" with contactId:
   - Evaluate factors: interaction history, contract completions,
     response consistency, platform rating if available
   - Create or update `contact-trust-score` Minion
   - Factors must be listed explicitly — never a black box number
2. Recalculate automatically after each new interaction

## Skill: Manage Relationships
1. When a person is discovered to work at an organization:
   - Create a `contact-relation` Minion with type "works_at"
2. When a referral is made:
   - Create a `contact-relation` with type "referred_by"
3. Never infer relationships without at least one supporting
   contact-note or contact-interaction as evidence

## Skill: Build Contact List
1. On receiving "build-list" with filter criteria:
   - Query person and organization Minions matching criteria
   - Create a `contact-list` Minion with matching ids
   - Tag the list with its purpose (e.g. "warm-leads-2026-Q1")

## Hard Rules
- Never store a contact-channel with allowedForAutomation: true
  without explicit confirmation from the owner
- Never merge two person records without logging the decision
  as a contact-note with full reasoning
- Every contact-preference with confidence "confirmed" must
  reference a specific contact-interaction as evidence
- Trust scores below 0.3 must be flagged to the Orchestrator
  before any automated outreach is attempted
```

---

The `contact-trust-score` with explicit `factors` is worth highlighting — it means the ContactAgent never silently decides not to reach out to someone. Every trust-based decision is auditable, which matters when agents are acting on your behalf with real people.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-contacts/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
contacts types list

# Show detailed schema for a specific type
contacts types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
contacts create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
contacts create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
contacts list <type>

# Show a specific Minion
contacts show <id>

# Search by text
contacts search "query"

# Output as JSON (for piping)
contacts list --json
contacts show <id> --json
```

### Update

```bash
# Update fields
contacts update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
contacts delete <id>
```

### Stats & Validation

```bash
# Show storage stats
contacts stats

# Validate a Minion JSON file against its schema
contacts validate ./my-minion.json
```
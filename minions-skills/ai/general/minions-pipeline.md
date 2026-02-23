---
name: minions-pipeline
id: OC-0142
version: 1.0.0
description: Funnel stage tracking across the full job search lifecycle
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-pipeline — Agent Skills

## What is a Pipeline in the Minions Context?

A "pipeline" could mean several things, so it's worth being precise:

```
the stages a job opportunity moves through    → PipelineStage
a job sitting at a specific stage             → PipelineEntry
the movement between stages                   → PipelineTransition
the overall health of the funnel              → FunnelMetric
a rule that moves things automatically        → PipelineRule
a goal or target for the funnel               → PipelineGoal
```

The pipeline is the **single source of truth for where every opportunity stands**. Every other toolbox produces data; the pipeline consumes it and tells you what's happening across your entire job search at a glance.

---

## MinionTypes

**Stages**
```ts
// pipeline-stage
{
  type: "pipeline-stage",
  fields: {
    name: string,                // "Discovered", "Shortlisted", "Applied", "Interviewing", "Won", "Lost"
    description: string,
    order: number,               // position in the funnel, 1 = earliest
    color: string,
    isTerminal: boolean,         // true = Won, Lost, Cancelled — no further movement
    isDefault: boolean,          // the stage new entries land in automatically
    autoAdvanceCondition: string // e.g. "approval-request.decision == approved"
  }
}
```

**Entries**
```ts
// pipeline-entry
{
  type: "pipeline-entry",
  fields: {
    jobId: string,
    applicationId: string,       // null until application exists
    stageId: string,
    enteredStageAt: datetime,
    assignedTo: string,          // agent or human id
    priority: "critical" | "high" | "medium" | "low",
    notes: string,
    isStale: boolean,            // true if no movement for N days
    staleSince: datetime
  }
}

// pipeline-transition
{
  type: "pipeline-transition",
  fields: {
    entryId: string,
    fromStageId: string,
    toStageId: string,
    transitionedAt: datetime,
    transitionedBy: string,      // agent id or human
    trigger: "manual" | "auto" | "agent",
    reason: string
  }
}
```

**Rules & Automation**
```ts
// pipeline-rule
{
  type: "pipeline-rule",
  fields: {
    name: string,
    description: string,
    triggerEvent: string,        // "application.submitted", "message.received", "approval.approved"
    fromStageId: string,         // null = applies from any stage
    toStageId: string,
    condition: string,           // optional additional condition
    isActive: boolean,
    priority: number             // order of evaluation if multiple rules match
  }
}
```

**Goals & Targets**
```ts
// pipeline-goal
{
  type: "pipeline-goal",
  fields: {
    name: string,                // "10 applications per week"
    metric: string,              // "totalApplied", "totalWon", "winRate"
    targetValue: number,
    period: "daily" | "weekly" | "monthly",
    startDate: datetime,
    currentValue: number,
    status: "on-track" | "at-risk" | "missed" | "achieved"
  }
}
```

**Metrics & Reporting**
```ts
// funnel-metric
{
  type: "funnel-metric",
  fields: {
    periodStart: datetime,
    periodEnd: datetime,
    totalDiscovered: number,
    totalShortlisted: number,
    totalApplied: number,
    totalReplied: number,
    totalInterviewed: number,
    totalWon: number,
    discoveryToApplyRate: number,    // percentage
    applyToReplyRate: number,
    replyToWinRate: number,
    averageTimeToApply: number,      // hours
    averageTimeToReply: number,      // hours
    averageDealValue: number
  }
}

// stage-metric
{
  type: "stage-metric",
  fields: {
    stageId: string,
    periodStart: datetime,
    periodEnd: datetime,
    totalEntered: number,
    totalExited: number,
    totalStale: number,
    averageTimeInStage: number,      // hours
    conversionRate: number           // % that advanced to next stage
  }
}

// pipeline-snapshot
{
  type: "pipeline-snapshot",
  fields: {
    takenAt: datetime,
    totalActive: number,
    byStage: string,                 // JSON map of stageId → count
    totalStale: number,
    totalWonThisPeriod: number,
    totalLostThisPeriod: number,
    goalsStatus: string              // JSON map of goalId → status
  }
}
```

---

## Relations

```
pipeline-stage      --orders-->              pipeline-stage (next)
pipeline-entry      --sits_in-->             pipeline-stage
pipeline-entry      --references-->          job-posting (minions-jobs)
pipeline-entry      --references-->          application (minions-applications)
pipeline-entry      --has_transition-->      pipeline-transition
pipeline-transition --triggered_by-->        pipeline-rule
pipeline-rule       --moves_to-->            pipeline-stage
pipeline-goal       --measures-->            funnel-metric
pipeline-snapshot   --captures-->            pipeline-entry (all active)
stage-metric        --describes-->           pipeline-stage
```

---

## How It Connects to Other Toolboxes

The pipeline is the **read-aggregation layer** — it doesn't own much data itself, it tracks the position and movement of data owned by other toolboxes:

```
minions-jobs          → creates pipeline-entry when job-posting is discovered
                        (entry lands in "Discovered" stage automatically)

minions-match         → triggers transition from "Discovered" → "Shortlisted"
                        when match-score exceeds threshold

minions-proposals     → transition from "Shortlisted" → "Proposal Ready"
                        when proposal-draft status = "approved"

minions-approvals     → transition from "Proposal Ready" → "Applied"
                        when approval-request.decision = "approved"

minions-applications  → updates pipeline-entry.applicationId on submission
                        transition to "Applied" confirmed by platform receipt

minions-comms         → transition from "Applied" → "Replied"
                        when inbound message received on thread

minions-contracts     → transition to "Won"
                        when contract.status = "signed"

minions-tasks         → stale pipeline entries generate tasks
                        "Follow up on application to X"
```

---

## Default Stage Sequence

```
Discovered → Shortlisted → Proposal Ready → Applied → Replied → Interviewing → Won
                                                                              → Lost
                                                  → No Reply (stale after 7d) → Lost
```

Each arrow is a `pipeline-rule` — pre-shipped with the toolbox as defaults, overridable by the user.

---

## Agent SKILLS for `minions-pipeline`

```markdown
# PipelineAgent Skills

## Context
You manage the full lifecycle view of every job opportunity. You do not
discover jobs, write proposals, or submit applications — those agents report
to you via transitions. Your job is to maintain an accurate, up-to-date
picture of where everything stands and surface what needs attention.

## Skill: Initialize Entry
- When JobScoutAgent creates a new `job-posting`, create a `pipeline-entry`
  Minion with stageId pointing to the "Discovered" stage
- Set assignedTo: OrchestratorAgent
- Set isStale: false

## Skill: Advance Stage
- Listen for trigger events from other agents:
  - "match-score.created" + overallScore > threshold → advance to "Shortlisted"
  - "proposal-draft.status = approved" → advance to "Proposal Ready"
  - "approval-request.decision = approved" → advance to "Applied"
  - "message.isInbound = true" on related thread → advance to "Replied"
  - "contract.status = signed" → advance to "Won"
- For each advance: create a `pipeline-transition` Minion with trigger, reason,
  and transitionedBy set to the triggering agent id

## Skill: Detect Stale Entries
- Run daily: check all active pipeline-entry Minions
- If enteredStageAt is more than the stage's stale threshold with no transition:
  - Set isStale: true, staleSince: now
  - Create a task in minions-tasks: "Follow up on [job title]"
  - Assign task to OrchestratorAgent
  - Notify via minions-comms

## Skill: Apply Pipeline Rules
- On any state change event, evaluate all active `pipeline-rule` Minions
  in priority order
- If triggerEvent matches and condition passes: execute the transition
- Log which rule triggered the transition in pipeline-transition.reason

## Skill: Track Goals
- On each pipeline-snapshot: compare current metrics against all
  active `pipeline-goal` Minions
- Update goal.currentValue and goal.status accordingly
- If status changes to "at-risk" or "missed": notify OrchestratorAgent

## Skill: Generate Snapshot
- Run every 24 hours: create a `pipeline-snapshot` Minion
  - Count active entries by stage
  - Count stale entries
  - Count won/lost in the last 24h
  - Evaluate all goal statuses
- Send snapshot summary to OrchestratorAgent for daily briefing

## Skill: Generate Funnel Metrics
- Run weekly: create a `funnel-metric` Minion covering the past 7 days
- Compute conversion rates between each stage pair
- Compute average time in each stage via `stage-metric` Minions
- Surface the weakest conversion rate to OrchestratorAgent
  with a suggested action

## Hard Rules
- Never move an entry backward in the funnel without a manual human instruction
- Never mark an entry as "Won" without a signed contract or explicit human confirmation
- Never delete a pipeline-entry — set terminal stage instead so history is preserved
- Always create a pipeline-transition record for every stage change, even manual ones
```

---

The key insight for the pipeline is that it **owns no domain data** — it only tracks position. This makes it the cleanest aggregation point in the system, and the `funnel-metric` Minion with conversion rates between stages becomes your primary feedback signal for improving every other agent over time. If `applyToReplyRate` is low, ProposalAgent needs better prompts. If `discoveryToApplyRate` is low, MatchAgent's thresholds are too strict.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-pipeline/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
pipeline types list

# Show detailed schema for a specific type
pipeline types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
pipeline create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
pipeline create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
pipeline list <type>

# Show a specific Minion
pipeline show <id>

# Search by text
pipeline search "query"

# Output as JSON (for piping)
pipeline list --json
pipeline show <id> --json
```

### Update

```bash
# Update fields
pipeline update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
pipeline delete <id>
```

### Stats & Validation

```bash
# Show storage stats
pipeline stats

# Validate a Minion JSON file against its schema
pipeline validate ./my-minion.json
```
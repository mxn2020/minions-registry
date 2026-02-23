---
name: minions-scheduler
id: OC-0156
version: 1.0.0
description: "Schedules, cron triggers, and timed execution definitions"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-scheduler — Agent Skills

## What is a Schedule in the Minions Context?

Before defining types, it's worth being precise. "Scheduling" can mean several different things:

```
something that runs on a timer          → Schedule
something that fires when X happens     → Trigger
a single execution of a schedule        → ScheduleRun
a queue of things waiting to run        → ExecutionQueue
a pause or override on a schedule       → ScheduleOverride
what happened across all runs           → ScheduleHistory
```

---

## MinionTypes

**Core**
```ts
// schedule
{
  type: "schedule",
  fields: {
    name: string,
    description: string,
    cronExpression: string,       // "0 */6 * * *" = every 6 hours
    timezone: string,             // "Europe/Berlin"
    targetAgentId: string,
    targetSkill: string,          // which SKILL the agent should run
    inputPayload: Record<string, any>,  // static inputs passed each run
    status: "active" | "paused" | "archived",
    createdAt: datetime,
    lastRunAt: datetime,
    nextRunAt: datetime,
    maxRetries: number,
    retryDelaySeconds: number,
    tags: string[]
  }
}

// trigger
{
  type: "trigger",
  fields: {
    name: string,
    description: string,
    eventType: string,            // "job-posting.created", "approval.approved"
    sourceMinonType: string,      // which MinionType emits this event
    condition: string,            // expression: "budget > 500 AND platform == upwork"
    targetAgentId: string,
    targetSkill: string,
    inputMapping: Record<string, any>,  // how event fields map to skill inputs
    isActive: boolean,
    lastFiredAt: datetime,
    fireCount: number
  }
}
```

**Execution**
```ts
// schedule-run
{
  type: "schedule-run",
  fields: {
    scheduleId: string,
    triggeredAt: datetime,
    startedAt: datetime,
    completedAt: datetime,
    status: "queued" | "running" | "success" | "failed" | "retrying" | "cancelled",
    attempt: number,              // 1 = first try, 2 = first retry, etc.
    agentRunId: string,           // ref to the actual agent-run Minion
    output: Record<string, any>,
    errorMessage: string,
    durationMs: number
  }
}

// trigger-fire
{
  type: "trigger-fire",
  fields: {
    triggerId: string,
    firedAt: datetime,
    sourceRefType: string,        // what caused it
    sourceRefId: string,
    resolvedInputs: Record<string, any>,
    agentRunId: string,
    status: "success" | "failed" | "skipped",
    skipReason: string            // why it was skipped if condition not fully met
  }
}

// execution-queue-item
{
  type: "execution-queue-item",
  fields: {
    sourceType: "schedule" | "trigger" | "manual",
    sourceId: string,
    targetAgentId: string,
    targetSkill: string,
    inputs: Record<string, any>,
    priority: "critical" | "high" | "medium" | "low",
    queuedAt: datetime,
    scheduledFor: datetime,       // earliest it should run
    status: "waiting" | "running" | "done" | "cancelled",
    agentRunId: string
  }
}
```

**Control**
```ts
// schedule-override
{
  type: "schedule-override",
  fields: {
    scheduleId: string,
    type: "pause" | "skip-next" | "run-now" | "change-cron",
    reason: string,
    requestedBy: string,
    appliedAt: datetime,
    expiresAt: datetime,          // when the override lifts automatically
    newCronExpression: string     // only for change-cron type
  }
}

// schedule-window
{
  type: "schedule-window",
  fields: {
    scheduleId: string,
    label: string,                // "business hours only", "weekdays"
    allowedDaysOfWeek: string[],  // ["mon", "tue", "wed", "thu", "fri"]
    allowedFromTime: string,      // "08:00"
    allowedToTime: string,        // "20:00"
    timezone: string,
    isActive: boolean
  }
}
```

**History & Metrics**
```ts
// schedule-history
{
  type: "schedule-history",
  fields: {
    scheduleId: string,
    periodStart: datetime,
    periodEnd: datetime,
    totalRuns: number,
    successCount: number,
    failureCount: number,
    averageDurationMs: number,
    lastStatus: string
  }
}
```

---

## Relations

```
schedule          --produces-->         schedule-run
schedule          --constrained_by-->   schedule-window
schedule          --overridden_by-->    schedule-override
schedule-run      --executes-->         agent-run (minions-agents)
trigger           --produces-->         trigger-fire
trigger-fire      --executes-->         agent-run (minions-agents)
schedule          --queues-->           execution-queue-item
trigger           --queues-->           execution-queue-item
execution-queue-item --resolves_to-->   agent-run (minions-agents)
schedule-run      --summarized_in-->    schedule-history
```

---

## How It Connects to Other Toolboxes

```
minions-agents      → every schedule and trigger ultimately produces an agent-run
minions-jobs        → "job-posting.created" fires a trigger → JobScoutAgent runs
minions-approvals   → a schedule can be paused via schedule-override pending approval
minions-costs       → each schedule-run contributes a cost-entry
minions-tasks       → a recurring-task in minions-tasks can reference a schedule as its engine
minions-comms       → on schedule failure, a notification is dispatched to Mehdi
```

The key relationship with `minions-tasks` is worth elaborating. A `recurring-task` in `minions-tasks` describes *what* repeats at the data/intent level. A `schedule` in `minions-scheduler` describes *when and how* it runs at the execution level. They complement each other — the recurring-task owns the business logic, the schedule owns the timing mechanism.

---

## Agent SKILLS for `minions-scheduler`

```markdown
# SchedulerAgent Skills

## Context
You manage all time-based and event-based execution in the Minions ecosystem.
You own minions-scheduler. You read from minions-agents to know which agents
and skills exist. You write schedule-run and trigger-fire records for every
execution. You never run agents directly — you queue them via execution-queue-item
and hand off to the relevant agent.

## Skill: Register Schedule
1. Validate cronExpression is well-formed
2. Validate targetAgentId exists in minions-agents
3. Validate targetSkill exists in that agent's skill-assignment list
4. Create `schedule` Minion with status "active"
5. Compute and set nextRunAt from cronExpression + timezone
6. Notify Orchestrator: "schedule registered: {name}"

## Skill: Evaluate Due Schedules
- Run this skill on a frequent heartbeat (e.g. every minute via OpenClaw)
1. Load all `schedule` Minions where status == "active" AND nextRunAt <= now
2. For each due schedule:
   a. Check for active `schedule-window` — if outside window, skip and advance nextRunAt
   b. Check for active `schedule-override` of type "skip-next" — skip and clear override
   c. Otherwise: create `execution-queue-item` with priority from schedule
   d. Update schedule.lastRunAt = now, compute new nextRunAt
3. Emit "queue-updated" to Orchestrator

## Skill: Evaluate Triggers
1. On any Minion create/update event, check all active `trigger` Minions
2. For each trigger where eventType matches:
   a. Evaluate condition expression against the event payload
   b. If condition passes: resolve inputMapping, create `execution-queue-item`
   c. Create `trigger-fire` Minion with status and resolved inputs
   d. Increment trigger.fireCount, update lastFiredAt

## Skill: Process Execution Queue
1. Load `execution-queue-item` Minions where status == "waiting"
   AND scheduledFor <= now, ordered by priority then queuedAt
2. For each item: instruct target agent to run targetSkill with inputs
3. Update item status to "running", record agentRunId when returned
4. On completion: update item status to "done" or "failed"

## Skill: Handle Failures and Retries
1. On schedule-run failure:
   a. Check schedule.maxRetries vs current attempt number
   b. If retries remaining: create new execution-queue-item with
      scheduledFor = now + retryDelaySeconds, increment attempt
   c. If no retries remaining: update schedule-run status to "failed"
   d. Create notification Minion in minions-comms: "Schedule {name} failed
      after {maxRetries} attempts"
2. Log failure in schedule-history

## Skill: Apply Override
1. On receiving "override-schedule" instruction from Orchestrator:
   a. Create `schedule-override` Minion with type, reason, expiresAt
   b. If type == "pause": update schedule.status to "paused"
   c. If type == "run-now": immediately create execution-queue-item,
      bypass window and nextRunAt checks
   d. If type == "change-cron": update schedule.cronExpression,
      recompute nextRunAt
2. Log override in audit-log (minions-approvals)

## Skill: Summarize Schedule Health
- Run daily, triggered by its own schedule
1. For each active schedule, load last 7 days of schedule-run Minions
2. Compute success rate, average duration, failure patterns
3. Create or update `schedule-history` Minion for each schedule
4. If any schedule has success rate < 80%: flag in notification to Mehdi

## Hard Rules
- Never execute an agent directly — always route through execution-queue-item
- Never create a schedule without validating the target agent and skill exist
- Always respect schedule-window constraints before queuing
- Always log every trigger-fire, even skipped ones, with skipReason
- Always create a schedule-run record before the agent-run starts,
  not after — so failures mid-run are still captured
```

---

The `schedule-window` type is worth highlighting — it's what prevents your JobScoutAgent from crawling Upwork at 3am or on weekends if platform ToS or rate limits make that risky. And the separation between `schedule` (the definition) and `schedule-run` (the instance) is what gives you a clean history without mutating the original schedule record.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-scheduler/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
scheduler types list

# Show detailed schema for a specific type
scheduler types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
scheduler create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
scheduler create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
scheduler list <type>

# Show a specific Minion
scheduler show <id>

# Search by text
scheduler search "query"

# Output as JSON (for piping)
scheduler list --json
scheduler show <id> --json
```

### Update

```bash
# Update fields
scheduler update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
scheduler delete <id>
```

### Stats & Validation

```bash
# Show storage stats
scheduler stats

# Validate a Minion JSON file against its schema
scheduler validate ./my-minion.json
```
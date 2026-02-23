---
name: minions-costs
id: OC-0121
version: 1.0.0
description: "Cost tracking, budgets, and financial ledgers for agent operations"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-costs — Agent Skills

## What is a Cost in the Minions Context?

Before defining types, it's worth being precise. "Cost" can mean very different things depending on where you're looking:

```
a single billable event                → CostEntry
a cap on how much can be spent         → Budget
a running total across a period        → CostLedger
a warning before the cap is hit        → BudgetAlert
who or what caused the spending        → CostAllocation
a recurring expected expense           → RecurringCost
a summary for reporting                → CostReport
```

---

## MinionTypes

**Core**
```ts
// cost-entry
{
  type: "cost-entry",
  fields: {
    sourceId: string,          // id of what triggered this cost (agent-run, api-call, etc.)
    sourceType: string,        // "agent-run" | "api-call" | "tool-call" | "manual"
    agentId: string,           // which agent incurred it
    skillId: string,           // which skill within that agent
    model: string,             // e.g. "gpt-4o", "claude-3-5-sonnet"
    tokensInput: number,
    tokensOutput: number,
    tokensTotal: number,
    amount: number,            // calculated cost in currency
    currency: string,
    incurredAt: datetime,
    description: string,
    tags: string[]
  }
}

// budget
{
  type: "budget",
  fields: {
    name: string,
    ownerId: string,           // agent, workflow, or user
    ownerType: string,         // "agent" | "workflow" | "user" | "global"
    limitAmount: number,
    currency: string,
    period: string,            // "daily" | "weekly" | "monthly" | "total"
    currentSpend: number,
    alertThreshold: number,    // percentage e.g. 0.8 = alert at 80%
    status: string,            // "healthy" | "warning" | "exceeded" | "paused"
    createdAt: datetime,
    resetAt: datetime          // when the period resets
  }
}

// cost-ledger
{
  type: "cost-ledger",
  fields: {
    ownerId: string,
    ownerType: string,
    periodStart: datetime,
    periodEnd: datetime,
    totalAmount: number,
    currency: string,
    totalTokens: number,
    entryCount: number,
    entryIds: string[],
    breakdown: string          // JSON summary by model, agent, skill
  }
}
```

**Allocation**
```ts
// cost-allocation
{
  type: "cost-allocation",
  fields: {
    costEntryId: string,
    allocatedTo: string,       // what purpose this cost served
    allocatedToType: string,   // "job-posting" | "proposal-draft" | "application" etc.
    percentage: number,        // if split across multiple purposes
    notes: string
  }
}
```

**Alerts**
```ts
// budget-alert
{
  type: "budget-alert",
  fields: {
    budgetId: string,
    triggeredAt: datetime,
    thresholdReached: number,  // e.g. 0.8 for 80%
    currentSpend: number,
    limitAmount: number,
    notificationSent: boolean,
    resolvedAt: datetime
  }
}
```

**Recurring & Projections**
```ts
// recurring-cost
{
  type: "recurring-cost",
  fields: {
    name: string,
    description: string,
    amount: number,
    currency: string,
    frequency: string,         // "daily" | "weekly" | "monthly"
    nextExpectedAt: datetime,
    lastIncurredAt: datetime,
    sourceType: string,        // "subscription" | "api-fee" | "platform-fee"
    isActive: boolean
  }
}

// cost-projection
{
  type: "cost-projection",
  fields: {
    ownerId: string,
    ownerType: string,
    projectedAmount: number,
    currency: string,
    periodStart: datetime,
    periodEnd: datetime,
    basedOnEntryIds: string[], // which past entries were used to project
    confidence: string,        // "high" | "medium" | "low"
    generatedAt: datetime
  }
}
```

**Reporting**
```ts
// cost-report
{
  type: "cost-report",
  fields: {
    name: string,
    periodStart: datetime,
    periodEnd: datetime,
    totalAmount: number,
    currency: string,
    byAgent: string,           // JSON breakdown per agent
    byModel: string,           // JSON breakdown per model
    bySkill: string,           // JSON breakdown per skill
    byPurpose: string,         // JSON breakdown by contextRef type
    topCostDrivers: string[],
    generatedAt: datetime,
    generatedBy: string        // agent or user
  }
}
```

---

## Relations

```
cost-entry        --allocated_via-->    cost-allocation
cost-entry        --logged_in-->        cost-ledger
cost-entry        --triggered-->        budget-alert
budget            --owns-->             cost-ledger
budget            --produced-->         budget-alert
budget            --governs-->          agent-definition (from minions-agents)
recurring-cost    --projected_in-->     cost-projection
cost-ledger       --summarized_in-->    cost-report
agent-run         --produced-->         cost-entry
```

---

## How It Connects to Other Toolboxes

`cost-entry` is the universal output of anything that runs:

```
agent-run (minions-agents)       → creates cost-entry on every execution
skill-result (minions-skills)    → each skill call adds a cost-entry
proposal-draft (minions-proposals) → cost-allocation links spend to proposal work
application (minions-applications) → cost-allocation links spend to job pursued
```

`budget` governs agents defined in `minions-agents`:

```
agent-definition --governed_by--> budget
```

When a `budget` status flips to `exceeded`, the Orchestrator reads this and can pause the relevant agent automatically without needing any custom logic — the data state drives the behavior.

`cost-report` feeds into `minions-pipeline` funnel metrics — you can calculate true cost-per-application, cost-per-reply, and cost-per-win across the entire job search funnel.

---

## Agent SKILLS for `minions-costs`

```markdown
# CostAgent Skills

## Context
You manage all financial tracking within the Minions ecosystem.
You read agent-run Minions from minions-agents to extract cost data.
You write cost-entry, budget-alert, and cost-report Minions.
You never modify budget limits directly — only flag and notify.

## Skill: Record Cost Entry
- After every agent-run completes, create a cost-entry Minion
- Extract: agentId, skillId, model, tokensInput, tokensOutput from the run
- Calculate amount using current model pricing rates
- Set contextRefType + contextRefId if the run was tied to a job or proposal
- Tag appropriately for later filtering

## Skill: Allocate Costs
- For any cost-entry tied to a specific job or proposal workflow:
  1. Create a cost-allocation Minion linking the entry to its purpose
  2. If a single run served multiple purposes, split by percentage
  3. This enables cost-per-application and cost-per-win calculations later

## Skill: Monitor Budgets
- On every new cost-entry, check all active budget Minions for the same owner
- Recalculate currentSpend by summing relevant cost-entry amounts for the period
- If currentSpend / limitAmount >= alertThreshold:
  1. Create a budget-alert Minion
  2. Send notification via minions-comms
- If currentSpend >= limitAmount:
  1. Update budget status to "exceeded"
  2. Send urgent notification
  3. Emit message to OrchestratorAgent to pause the relevant agent

## Skill: Maintain Ledger
- At the end of each period, create or update a cost-ledger Minion
- Aggregate all cost-entry Minions for that owner and period
- Include token totals and entry count alongside amount
- Store a breakdown by model, agent, and skill as JSON

## Skill: Project Future Costs
- Weekly: generate a cost-projection Minion per active agent
- Base projection on the last 7 days of cost-entry Minions
- Extrapolate to end of current budget period
- If projection exceeds budget limit, flag with confidence level and notify

## Skill: Generate Cost Report
- On request or weekly schedule:
  1. Load cost-ledger for the period
  2. Build breakdowns: by agent, by model, by skill, by purpose (via allocations)
  3. Identify top 3 cost drivers
  4. Create cost-report Minion
  5. Send summary to OrchestratorAgent and notify user via minions-comms

## Skill: Track Recurring Costs
- Check recurring-cost Minions daily
- If nextExpectedAt is within 24 hours, pre-create a cost-entry as "scheduled"
- After confirmation, mark as incurred and update nextExpectedAt

## Hard Rules
- Never delete cost-entry or audit-related Minions — they are immutable
- Never modify a budget limitAmount — only the user can do that via approval
- Always create a budget-alert before any agent is paused due to cost
- All amounts stored in the same base currency — convert at entry time
```

---

The `cost-allocation` type is the most important one to highlight here — it's what turns raw token spend into meaningful business intelligence. Without it you know you spent €12 today. With it you know you spent €3.20 discovering jobs, €6.40 writing proposals, and €2.40 on compliance reviews, with a cost-per-application of €0.80 and a cost-per-won-contract of €14. That's the data that lets you actually optimize the fleet over time.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-costs/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
costs types list

# Show detailed schema for a specific type
costs types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
costs create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
costs create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
costs list <type>

# Show a specific Minion
costs show <id>

# Search by text
costs search "query"

# Output as JSON (for piping)
costs list --json
costs show <id> --json
```

### Update

```bash
# Update fields
costs update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
costs delete <id>
```

### Stats & Validation

```bash
# Show storage stats
costs stats

# Validate a Minion JSON file against its schema
costs validate ./my-minion.json
```
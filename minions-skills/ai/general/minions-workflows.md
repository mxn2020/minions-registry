---
name: minions-workflows
id: OC-0172
version: 1.0.0
description: "Workflow definitions, step sequences, transitions, and run history"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-workflows — Agent Skills

## What is a Workflow in the Minions Context?

Before defining types, it's worth being precise. A "workflow" can mean several different things:

```
a reusable multi-step process             → WorkflowDefinition
a single step in that process             → WorkflowStep
a running instance of a workflow          → WorkflowRun
a transition between steps               → WorkflowTransition
what triggered it                         → schedule, event, or manual
```

---

## MinionTypes

**Core**
```ts
// workflow-definition
{
  type: "workflow-definition",
  fields: {
    name: string,
    description: string,
    clawspaceId: string,             // which clawspace this workflow belongs to
    version: string,                 // semver, e.g. "1.0.0"
    triggerType: "schedule" | "event" | "manual",
    triggerConfig: string,           // cron expression, event name, or empty
    status: "active" | "paused" | "archived",
    createdAt: datetime,
    updatedAt: datetime
  }
}

// workflow-step
{
  type: "workflow-step",
  fields: {
    workflowId: string,
    name: string,
    stepIndex: number,               // sequential order within the workflow
    agentId: string,                 // which agent executes this step
    skillRef: string,                // skill identifier within that agent
    inputMapping: string,            // JSON mapping of inputs from previous step
    outputMapping: string,           // JSON mapping of outputs to next step
    onSuccess: string,               // next step name or "complete"
    onFailure: string,               // step name, "retry", "abort", or "human-review"
    timeoutMs: number                // max execution time before failure
  }
}
```

**Execution**
```ts
// workflow-run
{
  type: "workflow-run",
  fields: {
    workflowId: string,
    status: "pending" | "running" | "paused" | "completed" | "failed" | "aborted",
    currentStepIndex: number,
    startedAt: datetime,
    completedAt: datetime,
    triggeredBy: string,             // scheduleId, eventName, or userId
    inputs: Record<string, any>,     // initial run inputs
    outputs: Record<string, any>,    // accumulated outputs
    errorMessage: string
  }
}

// workflow-transition
{
  type: "workflow-transition",
  fields: {
    runId: string,
    fromStep: string,
    toStep: string,
    triggeredAt: datetime,
    reason: string,                  // "success", "failure", "timeout", "human-override"
    durationMs: number               // time spent on the from-step
  }
}
```

---

## Relations

```
workflow-definition  --contains-->       workflow-step
workflow-definition  --instantiated-->   workflow-run
workflow-run         --logged-->         workflow-transition
workflow-step        --executes_via-->   agent-definition (minions-agents)
workflow-step        --uses_skill-->     skill-definition (minions-skills)
workflow-run         --triggered_by-->   schedule (minions-scheduler)
```

---

## How It Connects to Other Toolboxes

`minions-workflows` provides the execution engine for all multi-step processes:

```
minions-orchestration  → workflow-definitions are scoped per clawspaceId
minions-agents         → each workflow-step maps to an agent + skill
minions-skills         → skillRef in workflow-step points to a skill-definition
minions-scheduler      → schedule triggers workflow-runs automatically
minions-tasks          → each workflow-run may spawn tasks for tracking
minions-approvals      → workflow-steps with onFailure: "human-review" create approval-requests
minions-costs          → each workflow-run accumulates cost across all step executions
```

The key insight: **workflows are data, not code**. An OrchestratorAgent reads a workflow-definition and executes steps sequentially, routing outputs from one agent to the inputs of the next. Changing a workflow means editing a Minion, not rewriting agent logic.

---

## Agent SKILLS for `minions-workflows`

```markdown
# WorkflowAgent Skills

## Context
You own the execution of all workflows across all clawspaces.
You load workflow-definitions, execute steps in sequence,
handle success/failure branching, and log every transition.
You do not perform domain work — you coordinate agents.

## Skill: Start Workflow Run
1. On trigger (schedule, event, or manual):
   - Load the workflow-definition by id
   - Create a `workflow-run` Minion with status "running"
   - Set currentStepIndex to 0
   - Begin executing the first step

## Skill: Execute Step
1. Load the workflow-step at currentStepIndex
2. Prepare inputs using inputMapping from accumulated run outputs
3. Invoke the target agent's skill via agent-message
4. Wait for completion (up to timeoutMs)
5. On success:
   - Apply outputMapping to merge results into run outputs
   - Create workflow-transition with reason "success"
   - Advance to onSuccess step
6. On failure:
   - Create workflow-transition with reason "failure"
   - Follow onFailure directive:
     - "retry": re-execute the same step (max 3 retries)
     - "abort": set run status to "failed", log error
     - "human-review": create approval-request, pause run
     - step-name: branch to that step
7. On timeout:
   - Create workflow-transition with reason "timeout"
   - Follow onFailure directive

## Skill: Resume Paused Run
1. On approval-request decision:
   - If approved: resume from current step with any modified inputs
   - If rejected: abort the run, log reason

## Skill: Complete Run
1. When the final step's onSuccess is "complete":
   - Set run status to "completed", set completedAt
   - Log final workflow-transition
   - Emit "workflow-complete" to OrchestratorAgent
   - Record cost summary via minions-costs

## Hard Rules
- Never skip a step — always execute in order unless branching via onFailure
- Every step transition must produce a workflow-transition Minion
- Max 3 retries per step before escalating to onFailure
- Timed-out steps always follow the failure path
- Workflow-run Minions are immutable after completion — never edit a finished run
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-workflows/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
workflows types list
workflows types show <type-slug>
```

### CRUD

```bash
workflows create <type> -t "Title" -s "status"
workflows list <type>
workflows show <id>
workflows update <id> --data '{ "status": "active" }'
workflows delete <id>
workflows search "query"
```

### Stats & Validation

```bash
workflows stats
workflows validate ./my-minion.json
```
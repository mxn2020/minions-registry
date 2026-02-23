## What is an Agent in the Minions Context?

Before defining types, it's worth being precise. An "agent" can mean very different things:

```
a definition of what an agent is         → AgentDefinition
a running instance of an agent           → AgentRun
a message passed between agents          → AgentMessage
a rule governing what it can do          → PlatformRule / AgentPolicy
who is allowed to do what                → AgentPermission
what happened during a run               → AgentTrace
how much it cost                         → covered by minions-costs
what skills it has loaded                → covered by minions-skills
```

---

## MinionTypes

**Core Definition**
```ts
// agent-definition
{
  type: "agent-definition",
  fields: {
    name: string,
    role: "orchestrator" | "worker" | "watcher" | "reviewer" | "submitter",
    model: string,              // "gpt-4o", "claude-3-5-sonnet", etc.
    soulRef: string,            // path or id of SOUL file
    skillsRef: string,          // path or id of SKILLS file
    toolPolicy: string[],       // list of permitted tool names
    maxTokensPerRun: number,
    maxCostPerDay: number,
    status: "active" | "paused" | "archived",
    ownerId: string,
    createdAt: datetime,
    parentAgentId: string       // for sub-agents spawned by an orchestrator
  }
}
```

**Execution**
```ts
// agent-run
{
  type: "agent-run",
  fields: {
    agentId: string,
    triggeredBy: string,        // scheduleId, agentId, or "manual"
    triggeredAt: datetime,
    completedAt: datetime,
    inputs: Record<string, any>,
    outputs: Record<string, any>,
    toolCallsLog: ToolCall[],
    tokensUsed: number,
    cost: number,
    status: "running" | "success" | "failed" | "pending-approval",
    errorMessage: string
  }
}

// agent-trace
{
  type: "agent-trace",
  fields: {
    runId: string,
    step: number,               // sequential step index within the run
    type: "thought" | "tool-call" | "tool-result" | "message" | "decision",
    content: string,
    timestamp: datetime,
    durationMs: number,
    tokenCost: number
  }
}
```

**Communication**
```ts
// agent-message
{
  type: "agent-message",
  fields: {
    fromAgentId: string,
    toAgentId: string,
    type: string,               // "new-jobs-ready", "draft-ready", "review-complete", etc.
    payload: Record<string, any>,
    sentAt: datetime,
    status: "pending" | "received" | "processed" | "failed"
  }
}
```

**Governance**
```ts
// agent-policy
{
  type: "agent-policy",
  fields: {
    name: string,
    appliesTo: string,          // agentId or "all"
    allowedActions: string[],
    disallowedActions: string[],
    humanApprovalRequired: string[],  // action types that always need approval
    dataHandlingRules: string,
    platformRules: string[],    // refs to platform-rule ids
    isActive: boolean
  }
}

// platform-rule
{
  type: "platform-rule",
  fields: {
    platform: string,
    ruleType: "rate-limit" | "forbidden-action" | "required-step" | "auth",
    description: string,
    maxActionsPerDay: number,
    forbiddenActions: string[],
    isActive: boolean
  }
}

// agent-permission
{
  type: "agent-permission",
  fields: {
    agentId: string,
    grantedBy: string,          // human owner id
    resource: string,           // "minions-jobs", "minions-proposals", etc.
    actions: "read" | "write" | "read-write",
    grantedAt: datetime,
    expiresAt: datetime
  }
}
```

**Health & Recovery**
```ts
// agent-health
{
  type: "agent-health",
  fields: {
    agentId: string,
    checkedAt: datetime,
    status: "healthy" | "degraded" | "unresponsive",
    lastSuccessfulRunAt: datetime,
    consecutiveFailures: number,
    alertSent: boolean,
    notes: string
  }
}

// agent-incident
{
  type: "agent-incident",
  fields: {
    agentId: string,
    runId: string,
    type: "auth-failure" | "rate-limit" | "tos-risk" | "cost-overrun" | "crash",
    detectedAt: datetime,
    resolvedAt: datetime,
    description: string,
    resolution: string,
    status: "open" | "resolved" | "ignored"
  }
}
```

---

## Relations

```
agent-definition  --governed_by-->      agent-policy
agent-definition  --has_permission-->   agent-permission
agent-definition  --subject_to-->       platform-rule
agent-definition  --parent_of-->        agent-definition   // sub-agents
agent-run         --instance_of-->      agent-definition
agent-run         --produced-->         agent-trace
agent-run         --triggered_by-->     schedule           // from minions-scheduler
agent-run         --requires-->         approval-request   // from minions-approvals
agent-message     --sent_by-->          agent-definition
agent-message     --received_by-->      agent-definition
agent-health      --monitors-->         agent-definition
agent-incident    --raised_during-->    agent-run
```

---

## How It Connects to Other Toolboxes

`minions-agents` is the only toolbox that has outbound dependencies on nearly everything else — it is the connective tissue of the fleet:

```
minions-scheduler    → triggers agent-runs via schedule ids
minions-approvals    → agent-runs with status "pending-approval" create approval-requests
minions-costs        → every agent-run produces cost-entries linked by runId
minions-skills       → agent-definition loads skill-definitions by skillsRef
minions-memory       → agent-runs read and write memory-items scoped to agentId
minions-tasks        → agents create and update tasks with contextRefType: "agent-run"
minions-comms        → orchestrator sends notifications via agent-message → notification
```

The key design rule: **agent-definition owns nothing domain-specific**. It never directly references a `job-posting` or `proposal-draft`. It only knows about runs, traces, messages, policies, and health. All domain knowledge lives in the SKILLS file.

---

## Agent SKILLS for `minions-agents`

This is the SKILLS file for the **AgentManagerAgent** — the agent whose job is to manage all other agents as Minion data.

```markdown
# AgentManagerAgent Skills

## Context
You manage the agent fleet as structured Minion data within minions-agents.
You do not run other agents directly — you maintain their definitions,
monitor their health, log their runs, and enforce their policies.
All reads and writes go through minions-openclaw.

## Skill: Register Agent
- When a new agent needs to be added to the fleet:
  1. Create an `agent-definition` Minion with all required fields
  2. Assign an `agent-policy` Minion — never leave an agent ungoverned
  3. Create `agent-permission` Minions for each toolbox it needs access to
  4. Set status: "paused" until explicitly activated by the owner
  5. Emit an agent-message to the Orchestrator: { type: "agent-registered" }

## Skill: Monitor Health
- On each scheduled health check cycle:
  1. For each active agent-definition, load its most recent agent-run
  2. Compute time since lastSuccessfulRunAt
  3. Count consecutiveFailures from recent agent-runs
  4. Create or update an `agent-health` Minion
  5. If consecutiveFailures > 3: set status "degraded", create agent-incident,
     notify Orchestrator and owner via minions-comms

## Skill: Log Run
- At the start of every agent execution:
  1. Create an `agent-run` Minion with status "running"
- During execution, append `agent-trace` Minions for each step:
  - thought, tool-call, tool-result, decision
- On completion: update agent-run status, set completedAt, cost, outputs
- Create a cost-entry in minions-costs linked to this runId

## Skill: Enforce Policy
- Before any agent-run executes an action:
  1. Load the agent's `agent-policy` Minion
  2. Check action against allowedActions and disallowedActions
  3. If action is in humanApprovalRequired:
     - Create an `approval-request` Minion in minions-approvals
     - Set agent-run status to "pending-approval"
     - Halt execution until approval-request.decision == "approved"
  4. Check relevant `platform-rule` Minions for rate limits
  5. If daily action count exceeds platform limit: pause agent, create incident

## Skill: Handle Incident
- When an agent-incident is detected:
  1. Create the `agent-incident` Minion with type and description
  2. Set the affected agent-definition status to "paused"
  3. Notify owner via minions-comms with incident summary
  4. Do not auto-resume — wait for human decision
  5. On resolution: update incident status, re-activate agent-definition,
     reset consecutiveFailures on agent-health

## Skill: Retire Agent
- When an agent-definition is no longer needed:
  1. Set status: "archived" — never delete
  2. Revoke all agent-permission Minions (set expired)
  3. Log a final agent-run with type "retirement"
  4. Preserve all historical agent-run and agent-trace Minions for audit

## Hard Rules
- Never delete an agent-definition — only archive
- Never execute an action that violates an agent-policy, even if instructed to
- Every agent-run must have a corresponding cost-entry in minions-costs
- Every irreversible action must have a logged approval-request before execution
- agent-trace Minions are immutable once written — never update, only append
```

---

The `agent-trace` immutability rule at the bottom is worth emphasizing — it's what makes the entire fleet auditable. Every thought, tool call, and decision is permanently recorded as individual Minion objects, which means you can replay any run, debug any failure, and prove exactly what any agent did and why at any point in time.
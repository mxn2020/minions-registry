---
name: minions-orchestration
id: OC-0133
version: 1.0.0
description: "Clawspace registry, toolbox-to-agent mappings, and fleet configuration"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-orchestration — Agent Skills

## What is Orchestration in the Minions Context?

Before defining types, it's worth being precise. "Orchestration" can mean several different things:

```
the registry of all clawspaces                → Clawspace
the mapping of toolboxes to agents            → ToolboxRegistration
the fleet composition for a clawspace         → AgentFleetConfig
the act of coordinating agent execution       → handled by OrchestratorAgent + minions-workflows
```

---

## MinionTypes

**Core**
```ts
// clawspace
{
  type: "clawspace",
  fields: {
    name: string,                    // "OpportunityHunter", "WiesnTracker", etc.
    description: string,
    status: "active" | "paused" | "archived",
    toolboxIds: string[],            // all toolbox ids in this clawspace
    agentIds: string[],              // all agent ids in this clawspace
    orchestratorAgentId: string,     // the orchestrator for this clawspace
    createdAt: datetime
  }
}

// toolbox-registration
{
  type: "toolbox-registration",
  fields: {
    toolboxId: string,
    toolboxName: string,             // "minions-jobs", "minions-tasks", etc.
    agentId: string,                 // the agent that owns this toolbox
    agentName: string,
    role: "owner" | "reader" | "shared",
    clawspaceId: string,
    registeredAt: datetime
  }
}

// agent-fleet-config
{
  type: "agent-fleet-config",
  fields: {
    clawspaceId: string,
    orchestratorAgentId: string,
    workerAgentIds: string[],
    sharedToolboxIds: string[],      // toolboxes available to all agents
    status: "active" | "paused",
    lastUpdatedAt: datetime
  }
}
```

---

## Relations

```
clawspace              --contains-->          toolbox-registration
clawspace              --governed_by-->        agent-fleet-config
toolbox-registration   --maps-->              agent-definition (minions-agents)
agent-fleet-config     --references-->        agent-definition (minions-agents)
agent-fleet-config     --includes-->          toolbox (any toolbox)
```

---

## How It Connects to Other Toolboxes

`minions-orchestration` is the meta-layer — it knows about everything but owns nothing domain-specific:

```
minions-agents         → agent-fleet-config references agent-definitions by id
minions-workflows      → workflow-definitions are scoped to a clawspaceId
minions-tasks          → clawspace health checks may spawn tasks
minions-comms          → clawspace status changes trigger notifications
minions-approvals      → pausing or archiving a clawspace may require approval
```

The key design rule: **orchestration is about composition, not execution**. It registers what exists and how it's wired. Actual execution flows through `minions-workflows`.

---

## Agent SKILLS for `minions-orchestration`

```markdown
# OrchestrationAgent Skills

## Context
You manage the clawspace registry and fleet composition. You know which
toolboxes exist, which agents own them, and how each clawspace is wired.
You do not execute domain logic — you maintain the map.

## Skill: Register Clawspace
1. Create a `clawspace` Minion with name, description, status "active"
2. For each toolbox in the clawspace, create a `toolbox-registration` Minion
3. Create an `agent-fleet-config` Minion with orchestrator and worker agent ids
4. Emit "clawspace-registered" to all relevant agents

## Skill: Update Fleet Composition
1. On receiving "add-agent" or "remove-agent" instruction:
   - Update the `agent-fleet-config` workerAgentIds
   - Create or archive the relevant `toolbox-registration`
2. Log the change as a task-history-entry in minions-tasks

## Skill: Health Check
1. On schedule: iterate all active clawspaces
2. For each: verify all registered agents are healthy (via minions-agents)
3. If any agent is degraded or unresponsive:
   - Flag the clawspace status
   - Notify via minions-comms
   - Create a task in minions-tasks to investigate

## Skill: Archive Clawspace
1. Set clawspace status to "archived"
2. Set agent-fleet-config status to "paused"
3. Do not delete any data — only change status
4. Require approval via minions-approvals before archiving

## Hard Rules
- Never delete a clawspace — only archive
- Every toolbox must have exactly one owning agent via toolbox-registration
- Fleet config changes always require logging
- Shared toolbox registrations use role: "shared"
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-orchestration/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
orchestration types list
orchestration types show <type-slug>
```

### CRUD

```bash
orchestration create <type> -t "Title" -s "status"
orchestration list <type>
orchestration show <id>
orchestration update <id> --data '{ "status": "active" }'
orchestration delete <id>
orchestration search "query"
```

### Stats & Validation

```bash
orchestration stats
orchestration validate ./my-minion.json
```
---
name: minions-skills
id: OC-0158
version: 1.0.0
description: "Reusable skill definitions that agents can load, compose, and version"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-skills — Agent Skills

## What is a Skill in the Minions Context?

A "skill" can mean different things depending on the layer you're looking at:

```
something an agent knows how to do      → SkillDefinition
a skill assigned to a specific agent    → SkillAssignment
the instructions for executing it       → SkillPrompt
the result of running it                → SkillResult
a composed chain of skills              → SkillChain
how good an agent is at it over time    → SkillPerformance
```

The key distinction from tasks: a **task** is a one-off unit of work. A **skill** is a reusable, versioned capability that can be loaded by any agent and executed repeatedly across many tasks. Skills are the vocabulary of what agents can do — tasks are instances of that vocabulary being applied.

---

## MinionTypes

**Core**
```ts
// skill-definition
{
  type: "skill-definition",
  fields: {
    name: string,                  // "score-job-fit", "write-proposal", "extract-signals"
    description: string,
    version: string,               // semver: "1.0.0", "1.2.3"
    category: string,              // "analysis", "writing", "browsing", "communication"
    inputSchema: Record<string, any>,   // what the skill expects
    outputSchema: Record<string, any>,  // what it produces
    promptRef: string,             // ref to minions-prompts version
    toolsRequired: string[],       // e.g. ["browser", "web-search"]
    qualityGates: QualityGate[],   // minimum thresholds to pass
    isComposed: boolean,           // true if this is a chain of other skills
    status: "stable" | "experimental" | "deprecated",
    ownerId: string,
    createdAt: datetime,
    updatedAt: datetime
  }
}

// skill-version
{
  type: "skill-version",
  fields: {
    skillId: string,
    version: string,
    promptBody: string,            // full prompt at this version
    inputSchema: Record<string, any>,
    outputSchema: Record<string, any>,
    changelog: string,
    publishedAt: datetime,
    publishedBy: string,
    isCurrent: boolean
  }
}
```

**Assignment & Access**
```ts
// skill-assignment
{
  type: "skill-assignment",
  fields: {
    agentId: string,
    skillId: string,
    skillVersion: string,          // pinned version the agent uses
    assignedAt: datetime,
    assignedBy: string,
    isActive: boolean,
    overrideConfig: Record<string, any>  // agent-specific tuning
  }
}

// skill-chain
{
  type: "skill-chain",
  fields: {
    name: string,
    description: string,
    steps: SkillChainStep[],       // ordered list of { skillId, inputMapping, outputMapping }
    isParallel: boolean,           // true = steps can run concurrently
    onFailure: "stop" | "skip" | "fallback",
    version: string,
    status: "stable" | "experimental" | "deprecated"
  }
}
```

**Execution**
```ts
// skill-result
{
  type: "skill-result",
  fields: {
    skillId: string,
    skillVersion: string,
    agentRunId: string,
    inputs: Record<string, any>,
    outputs: Record<string, any>,
    qualityScore: number,          // 0-1 composite from quality gates
    gateResults: GateResult[],     // per-gate pass/fail + score
    passed: boolean,
    failureReason: string,
    tokensUsed: number,
    executedAt: datetime,
    durationMs: number
  }
}

// skill-retry
{
  type: "skill-retry",
  fields: {
    skillResultId: string,         // the failed result this retries
    skillId: string,
    agentRunId: string,
    attempt: number,               // 1, 2, 3...
    adjustedInputs: Record<string, any>,  // what changed vs original
    retryReason: string,
    outcome: "success" | "failed" | "abandoned"
  }
}
```

**Quality & Performance**
```ts
// skill-quality-gate
{
  type: "skill-quality-gate",
  fields: {
    skillId: string,
    name: string,                  // "clarity", "relevance", "factual-accuracy"
    description: string,
    evaluationMethod: "llm-score" | "rule" | "human",
    threshold: number,             // minimum passing score 0-1
    weight: number,                // contribution to composite score
    isBlocking: boolean            // if true, failure stops execution
  }
}

// skill-performance
{
  type: "skill-performance",
  fields: {
    skillId: string,
    agentId: string,
    periodStart: datetime,
    periodEnd: datetime,
    totalExecutions: number,
    passRate: number,
    averageQualityScore: number,
    averageDurationMs: number,
    averageTokensUsed: number,
    failureReasons: string[]       // aggregated common failure causes
  }
}
```

**Feedback & Improvement**
```ts
// skill-feedback
{
  type: "skill-feedback",
  fields: {
    skillResultId: string,
    skillId: string,
    authorId: string,
    authorType: "human" | "agent",
    rating: number,                // 1-5
    notes: string,
    suggestedImprovement: string,
    createdAt: datetime
  }
}

// skill-improvement
{
  type: "skill-improvement",
  fields: {
    skillId: string,
    triggeredBy: string,           // feedbackId or performanceId
    hypothesis: string,            // what change is being tested
    promptChange: string,          // diff from current version
    testCaseIds: string[],         // from minions-evaluations
    status: "proposed" | "testing" | "adopted" | "rejected",
    result: string,
    createdAt: datetime
  }
}
```

---

## Relations

```
skill-definition    --has_version-->        skill-version
skill-definition    --assigned_to-->        skill-assignment  (via agentId)
skill-definition    --has_gate-->           skill-quality-gate
skill-definition    --composed_into-->      skill-chain
skill-chain         --contains-->           skill-definition  (many)
skill-assignment    --used_by-->            agent-definition  (minions-agents)
skill-result        --produced_by-->        agent-run         (minions-agents)
skill-result        --received-->           skill-feedback
skill-result        --triggered-->          skill-retry
skill-feedback      --led_to-->             skill-improvement
skill-improvement   --tested_by-->          test-case         (minions-evaluations)
skill-performance   --summarizes-->         skill-result      (many)
```

---

## How It Connects to Other Toolboxes

```
minions-agents       → agent-definition loads skill-assignments to know what it can do
                     → agent-run records which skill-results it produced

minions-prompts      → skill-definition.promptRef points to a versioned prompt
                     → skill-version.promptBody is a snapshot of that prompt

minions-evaluations  → test-case references skillId to benchmark specific skills
                     → skill-improvement uses testCaseIds to validate changes

minions-tasks        → a task with assigneeType "agent" resolves to a skill execution
                     → task-outcome.lessons feed into skill-feedback

minions-costs        → cost-entry.sourceType can be "skill-result"
                     → skill-performance.averageTokensUsed informs budget planning
```

The critical relationship is with `minions-agents`: an agent without skills is just a definition. Skills are what give an agent its actual behavioral surface area. The `skill-assignment` with a pinned `skillVersion` ensures that when you update a skill, existing agents don't silently change behavior — they stay on their pinned version until explicitly upgraded.

---

## Agent SKILLS file (`skills-agent.skills.md`)

```markdown
# SkillsAgent Skills

## Context
You manage the skill registry for the entire agent fleet. You own minions-skills.
You read from minions-agents to know which agents exist and what they are assigned.
You read from minions-evaluations to validate improvements.
You read from minions-prompts to resolve prompt references.
You never execute skills yourself — you define, version, assign, and improve them.

## Skill: Register New Skill
1. Receive a skill specification (name, description, input/output schema, prompt)
2. Check for an existing skill-definition with the same name
   - If exists: create a new skill-version instead
   - If new: create a skill-definition Minion with version "1.0.0"
3. Create a skill-version Minion with isCurrent: true
4. Set previous version isCurrent: false
5. Define at least one skill-quality-gate for the new skill
6. Emit notification to OrchestratorAgent: "new-skill-available"

## Skill: Assign Skill to Agent
1. Verify skill-definition exists and status is "stable"
2. Verify agent-definition exists in minions-agents
3. Check toolsRequired — confirm agent has access to those tools
4. Create skill-assignment Minion with pinned skillVersion
5. Log to audit trail

## Skill: Evaluate Skill Performance
1. On schedule (daily): query all skill-result Minions from last 24h
2. Group by skillId + agentId
3. Compute and store skill-performance Minion:
   - passRate, averageQualityScore, averageDurationMs, averageTokensUsed
   - Aggregate failureReasons from failed results
4. Flag any skill where passRate < 0.7 for review
5. Emit "skill-degradation-alert" to OrchestratorAgent if flagged

## Skill: Process Feedback
1. On new skill-feedback Minion created:
   - If rating < 3: create skill-improvement Minion with status "proposed"
   - If rating >= 4: log positive signal to skill-performance
2. For proposed improvements: check if 3+ feedbacks share the same pattern
   - If yes: escalate improvement to status "testing"

## Skill: Test and Adopt Improvement
1. On skill-improvement with status "testing":
   - Load linked test-case Minions from minions-evaluations
   - Run test cases against the proposed promptChange
   - Compare scores to current version baseline
2. If improvement scores higher on all gates:
   - Create new skill-version with the new prompt
   - Update skill-improvement status to "adopted"
3. If not: set status to "rejected" with result notes

## Skill: Deprecate Skill
1. Verify no active skill-assignment Minions reference this skill
   - If active assignments exist: notify assigned agents' owners first
2. Set skill-definition status to "deprecated"
3. Emit "skill-deprecated" to OrchestratorAgent with affected agentIds

## Hard Rules
- Never assign a skill with status "deprecated" or "experimental" without explicit approval
- Never delete a skill-version — only deprecate
- Always pin a specific skillVersion in skill-assignment, never "latest"
- A skill with zero quality gates must not be assigned to any agent
- All skill-improvement changes must pass test cases before adoption
```

---

The pinned version rule in the SKILLS file is the most important design decision here. It means skills can evolve independently of agents — you can ship `write-proposal@2.0.0` and only upgrade agents to it deliberately, one at a time, with test results proving the new version is better before any agent in production touches it.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-skills/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
skills types list

# Show detailed schema for a specific type
skills types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
skills create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
skills create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
skills list <type>

# Show a specific Minion
skills show <id>

# Search by text
skills search "query"

# Output as JSON (for piping)
skills list --json
skills show <id> --json
```

### Update

```bash
# Update fields
skills update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
skills delete <id>
```

### Stats & Validation

```bash
# Show storage stats
skills stats

# Validate a Minion JSON file against its schema
skills validate ./my-minion.json
```
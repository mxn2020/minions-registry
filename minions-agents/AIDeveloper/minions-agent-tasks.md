## What is an Agent Task in the Minions Context?

```
a task submitted via `gh agent-task create`     → AgentTask
a batch of related tasks for a feature set      → TaskBatch
the outcome and quality assessment              → TaskResult
```

This is the core toolbox of AIDeveloper. Every feature implementation flows through here.

---

## MinionTypes

```ts
// agent-task
{
  type: "agent-task",
  fields: {
    repoDefinitionId: string,
    title: string,                   // "Add user authentication with Clerk"
    prompt: string,                  // the full prompt sent to gh agent-task
    promptTemplateId: string,        // optional: which dev-prompt was used
    branch: string,                  // auto-created by the agent
    prNumber: number,                // PR number created by the agent
    prUrl: string,
    status: "queued" | "submitted" | "in-progress" | "completed" | "failed" | "merged",
    submittedAt: datetime,
    completedAt: datetime,
    reviewStatus: "pending" | "approved" | "changes-requested" | "merged",
    mergedAt: datetime
  }
}

// task-batch — groups agent-tasks that implement a feature set in order
// task-result — quality assessment of completed agent-task output
```

---

## The `gh agent-task` Workflow

```bash
# Create an agent task (autonomous AI implementation)
gh agent-task create "Add a REST API with Express.js, include CRUD for users and auth middleware"

# List active tasks
gh agent-task list

# View a specific task
gh agent-task view <task-id>
```

The agent autonomously:
1. Creates a branch
2. Implements the requested changes
3. Opens a draft PR
4. Requests review

---

## Relations

```
agent-task         --targets-->          repo-definition (minions-repos)
agent-task         --uses_prompt-->      prompt-template (minions-dev-prompts)
agent-task         --grouped_in-->       task-batch
agent-task         --produces-->         task-result
task-batch         --planned_for-->      release-plan (minions-releases)
agent-task         --approved_via-->     approval-request (minions-approvals)
```

---

## How It Connects to Other Toolboxes

```
minions-repos         → agent-tasks run against specific repos
minions-dev-prompts   → prompt templates provide reusable patterns
minions-releases      → completed task batches feed into release plans
minions-approvals     → PR reviews can create approval requests
minions-evaluations   → task results can be scored for quality
minions-costs         → token usage and API costs tracked per task
```

---

## Agent SKILLS for `minions-agent-tasks`

```markdown
# AgentTaskAgent Skills

## Context
You manage the `gh agent-task` lifecycle. You take feature requests,
compose effective prompts, submit them as agent-tasks, track execution,
and assess results. You are the bridge between planning and implementation.

## Skill: Submit Task
1. Load repo-definition to get repo name and context
2. Load prompt-template if specified, fill in variables
3. Run `gh agent-task create "<prompt>"` in the repo
4. Create agent-task Minion with status "submitted"
5. Poll `gh agent-task list` for completion

## Skill: Submit Batch
1. Load task-batch with ordered taskIds
2. Submit agent-tasks sequentially (wait for each to complete)
3. After each: create task-result with quality assessment
4. Update batch status on completion

## Skill: Track Task
1. Poll `gh agent-task view <id>` for status updates
2. When PR is created: update prNumber, prUrl, status
3. When review actions happen: update reviewStatus
4. When merged: update mergedAt, set status "merged"

## Skill: Assess Quality
1. After task completion: check build status, test results
2. Count files changed, lines added/removed
3. Create task-result Minion with quality notes
4. If quality below threshold: flag for human review

## Hard Rules
- Never submit a task without a clear, specific prompt
- Every task must track to exactly one repo-definition
- Batched tasks execute sequentially — never in parallel
- Failed tasks create retry entries, not silent drops
```

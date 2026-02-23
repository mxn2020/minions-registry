## What is a Task in the Minions Context?

Before defining types, it's worth being precise. A "task" can mean very different things:

```
a unit of work to be done          → Task
a collection of tasks              → TaskList / Project
something that repeats             → RecurringTask
something blocking something else  → Dependency
a snapshot of progress             → TaskStatus / Checkpoint
who is responsible                 → Assignment
what happened to it over time      → TaskHistory
```

---

## MinionTypes

**Core**
```ts
// task
{
  type: "task",
  fields: {
    title: string,
    description: string,
    status: "backlog" | "todo" | "in-progress" | "blocked" | "done" | "cancelled",
    priority: "critical" | "high" | "medium" | "low",
    assigneeId: string,         // ref to a person or agent
    createdBy: string,
    createdAt: datetime,
    dueAt: datetime,
    completedAt: datetime,
    tags: string[],
    parentTaskId: string,       // for subtasks
    contextRef: {               // what this task belongs to
      type: string,             // "job-posting", "proposal-draft", etc.
      id: string
    }
  }
}

// task-list
{
  type: "task-list",
  fields: {
    name: string,
    description: string,
    taskIds: string[],
    ordered: boolean,           // true = sequence matters
    ownerId: string,
    groupId: string             // ref to minion-group
  }
}

// task-dependency
{
  type: "task-dependency",
  fields: {
    taskId: string,
    dependsOnTaskId: string,
    type: "blocks" | "required-by" | "related-to"
  }
}
```

**Recurrence**
```ts
// recurring-task
{
  type: "recurring-task",
  fields: {
    templateTaskId: string,     // base task definition
    schedule: string,           // cron expression
    nextRunAt: datetime,
    lastRunAt: datetime,
    spawnedTaskIds: string[],   // all instances created from this
    status: "active" | "paused"
  }
}
```

**Assignment & Responsibility**
```ts
// task-assignment
{
  type: "task-assignment",
  fields: {
    taskId: string,
    assigneeId: string,
    assigneeType: "human" | "agent",
    assignedAt: datetime,
    assignedBy: string,
    role: "owner" | "collaborator" | "reviewer" | "observer"
  }
}
```

**Progress & History**
```ts
// task-checkpoint
{
  type: "task-checkpoint",
  fields: {
    taskId: string,
    label: string,              // "halfway done", "first draft complete"
    completedAt: datetime,
    notes: string
  }
}

// task-history-entry
{
  type: "task-history-entry",
  fields: {
    taskId: string,
    changedAt: datetime,
    changedBy: string,          // person or agent id
    field: string,              // which field changed
    from: any,
    to: any
  }
}
```

**Feedback & Outcome**
```ts
// task-comment
{
  type: "task-comment",
  fields: {
    taskId: string,
    authorId: string,
    authorType: "human" | "agent",
    body: string,
    createdAt: datetime,
    resolvedAt: datetime
  }
}

// task-outcome
{
  type: "task-outcome",
  fields: {
    taskId: string,
    result: "success" | "partial" | "failed",
    summary: string,
    artifactIds: string[],      // anything produced by completing this task
    lessons: string             // for agent learning loop
  }
}
```

---

## Relations

```
task            --belongs_to-->     task-list
task            --subtask_of-->     task
task            --blocked_by-->     task-dependency
task            --assigned_to-->    task-assignment
task            --has_checkpoint--> task-checkpoint
task            --has_comment-->    task-comment
task            --produced-->       task-outcome
recurring-task  --spawned-->        task
task            --logged_in-->      task-history-entry
```

---

## How It Connects to Other Toolboxes

The `contextRef` field on `task` is the key bridge:

```
agent-run (minions-agents)     → spawns tasks with contextRef: { type: "agent-run" }
job-posting (minions-jobs)     → has tasks like "research this client"
proposal-draft (minions-proposals) → has tasks like "add portfolio item X"
approval-request (minions-agents)  → is itself a task waiting for human action
```

So rather than every toolbox defining its own ad-hoc "todo" concept, they all point to `minions-tasks` for anything that represents work to be done.

---

## Agent SKILLS for `minions-tasks`

```markdown
## Skill: Create Task
- When any workflow step produces a unit of work, create a `task` Minion
- Always set contextRef to the originating Minion (job, proposal, run, etc.)
- Set assigneeType: "agent" if automatable, "human" if approval or judgment needed

## Skill: Manage Task List
- Group related tasks into a `task-list` Minion
- If ordered: sequence matters, do not start task N+1 until task N is done
- If unordered: can parallelize across agents

## Skill: Track Progress
- On any status change: create a `task-history-entry`
- On meaningful milestone: create a `task-checkpoint`
- On completion: always create a `task-outcome` with result + lessons

## Skill: Handle Blocked Tasks
- If a task status becomes "blocked", check `task-dependency` Minions
- Notify assignee or Orchestrator with blocking reason
- Resume automatically when blocking task reaches "done"

## Skill: Recurring Tasks
- Check `recurring-task` Minions on schedule
- Spawn new `task` instance from template when nextRunAt is reached
- Update nextRunAt and append to spawnedTaskIds
```

---

The `task-outcome` with a `lessons` field is worth highlighting — it gives every agent in your fleet a structured way to feed observations back into the system over time, which becomes the foundation of a learning loop across all your purpose bundles.
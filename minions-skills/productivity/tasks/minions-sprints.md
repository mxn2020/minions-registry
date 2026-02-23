---
name: minions-sprints
id: OC-0161
version: 1.0.0
description: "Sprint definitions, scope, and velocity tracking"
category: productivity
subcategory: tasks
tags: ["minion", "productivity", "tasks"]
comments:
---

# minions-sprints — Agent Skills

## What is a Sprint in the Minions Context?

```
a time-boxed iteration                    → Sprint
lessons from a completed sprint           → SprintRetrospective
```

Only used by `it-project` variant in ProjectPilot.

## MinionTypes
```ts
// sprint — number, dates, goal, planned/completed story points
// sprint-retrospective — went well, needs improvement, action items
```

## Relations
```
sprint            --belongs_to-->        project (minions-projects, variant=it-project)
sprint            --contains-->          task (minions-tasks)
sprint            --reflected_in-->      sprint-retrospective
```

## Agent SKILLS
```markdown
# SprintAgent Skills
## Skill: Plan Sprint — select tasks, set goal, estimate points
## Skill: Close Sprint — calculate velocity, create retrospective
## Hard Rules — sprints cannot overlap for the same project
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-sprints/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
sprints types list
sprints types show <type-slug>
```

### CRUD

```bash
sprints create <type> -t "Title" -s "status"
sprints list <type>
sprints show <id>
sprints update <id> --data '{ "status": "active" }'
sprints delete <id>
sprints search "query"
```

### Stats & Validation

```bash
sprints stats
sprints validate ./my-minion.json
```
---
name: minions-milestones
id: OC-0131
version: 1.0.0
description: "Milestone definitions, dependencies, and completion criteria"
category: productivity
subcategory: tasks
tags: ["minion", "productivity", "tasks"]
comments:
---

# minions-milestones — Agent Skills

## What is a Milestone in the Minions Context?

```
a major project checkpoint                → Milestone
a health check on progress                → MilestoneCheck
```

## MinionTypes
```ts
// milestone — name, due date, completion criteria, dependencies
// milestone-check — periodic on-track assessment with blockers
```

## Relations
```
milestone         --belongs_to-->        project (minions-projects)
milestone         --depends_on-->        milestone
milestone         --checked_by-->        milestone-check
milestone         --has_tasks-->         task (minions-tasks)
```

## Agent SKILLS
```markdown
# MilestoneAgent Skills
## Skill: Track Milestones — check progress, flag at-risk items
## Skill: Create Health Checks — periodic milestone-check Minions
## Hard Rules — milestones with dependencies can't complete before deps
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-milestones/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
milestones types list
milestones types show <type-slug>
```

### CRUD

```bash
milestones create <type> -t "Title" -s "status"
milestones list <type>
milestones show <id>
milestones update <id> --data '{ "status": "active" }'
milestones delete <id>
milestones search "query"
```

### Stats & Validation

```bash
milestones stats
milestones validate ./my-minion.json
```
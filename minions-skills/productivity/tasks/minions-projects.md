---
name: minions-projects
id: OC-0144
version: 1.0.0
description: "Project definitions, variants, goals, status, and ownership"
category: productivity
subcategory: tasks
tags: ["minion", "productivity", "tasks"]
comments:
---

# minions-projects — Agent Skills

## What is a Project in the Minions Context?

```
a project with goals and a variant        → Project
a periodic health summary                 → ProjectSummary
```

**Variants:** `it-project`, `personal-project`, `creative-project`, `business-project` — each variant activates different shared toolboxes.

## MinionTypes
```ts
// project — name, variant, goals, status, owner, dates
// project-summary — periodic health + completion % + blockers
```
See TOML for full fields.

## Relations
```
project           --has_milestone-->     milestone (minions-milestones)
project           --has_sprint-->        sprint (minions-sprints, it-project only)
project           --tracked_by-->        project-summary
project           --has_decision-->      decision (minions-decisions)
project           --has_risk-->          risk (minions-risks)
project           --has_stakeholder-->   stakeholder (minions-stakeholders)
```

## Agent SKILLS
```markdown
# ProjectAgent Skills
## Skill: Create Project — define variant, goals, timeline, owner
## Skill: Generate Summary — assess health, blockers, completion
## Hard Rules — never delete projects, only archive
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-projects/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
projects types list
projects types show <type-slug>
```

### CRUD

```bash
projects create <type> -t "Title" -s "status"
projects list <type>
projects show <id>
projects update <id> --data '{ "status": "active" }'
projects delete <id>
projects search "query"
```

### Stats & Validation

```bash
projects stats
projects validate ./my-minion.json
```
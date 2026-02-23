---
name: minions-oss-features
id: OC-0136
version: 1.0.0
description: "Feature backlog, daily picks, implementation plans, and acceptance criteria"
category: cloud
subcategory: oss
tags: ["minion", "cloud", "oss"]
comments:
---

# minions-oss-features — Agent Skills

## What is an Feature in the Minions Context?

```
a feature in the backlog                  → Feature
a step-by-step implementation plan        → ImplementationPlan
```

The daily loop picks one feature per active project.

## MinionTypes
```ts
// feature — title, acceptance criteria, complexity, priority, selected date
// implementation-plan — steps, estimated hours, files affected, tests
```

## Relations
```
feature           --belongs_to-->        oss-project (minions-oss-projects)
feature           --planned_by-->        implementation-plan
feature           --released_in-->       release (minions-oss-releases)
```

## Agent SKILLS
```markdown
# FeatureAgent Skills
## Skill: Select Daily Feature — pick highest-priority feature per project
## Skill: Plan Implementation — create step-by-step plan
## Hard Rules — one feature per project per day, no parallel features
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-oss-features/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
oss-features types list
oss-features types show <type-slug>
```

### CRUD

```bash
oss-features create <type> -t "Title" -s "status"
oss-features list <type>
oss-features show <id>
oss-features update <id> --data '{ "status": "active" }'
oss-features delete <id>
oss-features search "query"
```

### Stats & Validation

```bash
oss-features stats
oss-features validate ./my-minion.json
```
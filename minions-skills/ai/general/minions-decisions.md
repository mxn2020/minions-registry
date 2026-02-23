---
name: minions-decisions
id: OC-0123
version: 1.0.0
description: "Logged decisions with rationale, alternatives, and outcome"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-decisions — Agent Skills

## What is a Decision in the Minions Context?

```
a logged project decision                 → Decision
a retrospective review                    → DecisionReview
```

## MinionTypes
```ts
// decision — title, rationale, alternatives, outcome, decided by/at
// decision-review — reviewed later: was it correct? lessons learned?
```

## Relations
```
decision          --belongs_to-->        project (minions-projects)
decision          --reviewed_by-->       decision-review
decision          --may_require-->       approval-request (minions-approvals)
```

## Agent SKILLS
```markdown
# DecisionAgent Skills
## Skill: Log Decision — capture rationale, alternatives, outcome
## Skill: Review Past Decisions — periodic retrospective
## Hard Rules — all irreversible decisions require approval first
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-decisions/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
decisions types list
decisions types show <type-slug>
```

### CRUD

```bash
decisions create <type> -t "Title" -s "status"
decisions list <type>
decisions show <id>
decisions update <id> --data '{ "status": "active" }'
decisions delete <id>
decisions search "query"
```

### Stats & Validation

```bash
decisions stats
decisions validate ./my-minion.json
```
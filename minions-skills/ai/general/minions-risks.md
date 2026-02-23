---
name: minions-risks
id: OC-0154
version: 1.0.0
description: "Risk register, likelihood, impact, and mitigation plans"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-risks — Agent Skills

## What is a Risk in the Minions Context?

```
an identified project risk                → Risk
a status update on a tracked risk         → RiskUpdate
```

## MinionTypes
```ts
// risk — title, likelihood, impact, risk score, mitigation plan, owner
// risk-update — periodic reassessment of likelihood and impact
```

## Relations
```
risk              --belongs_to-->        project (minions-projects)
risk              --updated_by-->        risk-update
risk              --mitigated_via-->     task (minions-tasks)
```

## Agent SKILLS
```markdown
# RiskAgent Skills
## Skill: Identify Risks — scan project state for new risks
## Skill: Update Risk Register — periodic risk-update Minions
## Hard Rules — high-impact risks require mitigation plans within 24h
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-risks/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
risks types list
risks types show <type-slug>
```

### CRUD

```bash
risks create <type> -t "Title" -s "status"
risks list <type>
risks show <id>
risks update <id> --data '{ "status": "active" }'
risks delete <id>
risks search "query"
```

### Stats & Validation

```bash
risks stats
risks validate ./my-minion.json
```
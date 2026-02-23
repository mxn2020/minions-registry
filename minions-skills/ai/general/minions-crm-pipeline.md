---
name: minions-crm-pipeline
id: OC-0122
version: 1.0.0
description: "Deal stages, transitions, revenue forecasts, and win/loss tracking"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-crm-pipeline — Agent Skills

## What is a CRM Pipeline in the Minions Context?

```
a potential or active deal                → Deal
a stage transition                        → DealTransition
a periodic revenue forecast               → RevenueForecast
```

## MinionTypes
```ts
// deal — lead, service, value, stage, probability, expected close date
// deal-transition — from/to stage, reason, changed by
// revenue-forecast — period, total pipeline, weighted forecast
```

## Agent SKILLS
```markdown
# PipelineAgent Skills
## Skill: Advance Deal — move through stages based on conversation signals
## Skill: Forecast Revenue — weighted projection from pipeline
## Hard Rules — every stage change must log a deal-transition
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-crm-pipeline/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
crm-pipeline types list
crm-pipeline types show <type-slug>
```

### CRUD

```bash
crm-pipeline create <type> -t "Title" -s "status"
crm-pipeline list <type>
crm-pipeline show <id>
crm-pipeline update <id> --data '{ "status": "active" }'
crm-pipeline delete <id>
crm-pipeline search "query"
```

### Stats & Validation

```bash
crm-pipeline stats
crm-pipeline validate ./my-minion.json
```
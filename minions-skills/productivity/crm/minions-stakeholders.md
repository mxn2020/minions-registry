---
name: minions-stakeholders
id: OC-0162
version: 1.0.0
description: "Stakeholder registry, roles, and communication preferences"
category: productivity
subcategory: crm
tags: ["minion", "productivity", "crm"]
comments:
---

# minions-stakeholders — Agent Skills

## What is a Stakeholder in the Minions Context?

```
a project stakeholder                     → Stakeholder
a communication sent to a stakeholder     → StakeholderUpdate
```

## MinionTypes
```ts
// stakeholder — name, role, influence, interest, communication pref
// stakeholder-update — type (status, milestone, risk), summary, channel
```

## Relations
```
stakeholder       --belongs_to-->        project (minions-projects)
stakeholder       --receives-->          stakeholder-update
stakeholder       --linked_to-->         contact (minions-contacts)
```

## Agent SKILLS
```markdown
# StakeholderAgent Skills
## Skill: Map Stakeholders — identify, classify by influence/interest
## Skill: Send Updates — periodic stakeholder-update via preferred channel
## Hard Rules — high-influence stakeholders get updates on every milestone
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-stakeholders/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
stakeholders types list
stakeholders types show <type-slug>
```

### CRUD

```bash
stakeholders create <type> -t "Title" -s "status"
stakeholders list <type>
stakeholders show <id>
stakeholders update <id> --data '{ "status": "active" }'
stakeholders delete <id>
stakeholders search "query"
```

### Stats & Validation

```bash
stakeholders stats
stakeholders validate ./my-minion.json
```
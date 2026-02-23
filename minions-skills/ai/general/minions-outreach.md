---
name: minions-outreach
id: OC-0141
version: 1.0.0
description: "Email templates, drip sequences, personalization rules, and send schedules"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-outreach — Agent Skills

## What is a Outreach in the Minions Context?

```
a reusable email template                 → EmailTemplate
a multi-step email sequence               → DripSequence
a record of a sent email                  → OutreachSend
```

## MinionTypes
```ts
// email-template — subject, body, intent, personalization fields
// drip-sequence — steps with delays, target segment
// outreach-send — lead, template, step index, sent/opened/clicked timestamps
```

## Agent SKILLS
```markdown
# OutreachAgent Skills
## Skill: Create Drip Sequence — define multi-step personalized emails
## Skill: Execute Send — personalize and send per schedule
## Hard Rules — respect cooldowns, never send duplicate emails
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-outreach/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
outreach types list
outreach types show <type-slug>
```

### CRUD

```bash
outreach create <type> -t "Title" -s "status"
outreach list <type>
outreach show <id>
outreach update <id> --data '{ "status": "active" }'
outreach delete <id>
outreach search "query"
```

### Stats & Validation

```bash
outreach stats
outreach validate ./my-minion.json
```
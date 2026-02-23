---
name: minions-conversations
id: OC-0120
version: 1.0.0
description: "Email threads, reply parsing, intent detection, and escalation triggers"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-conversations — Agent Skills

## What is a Conversation in the Minions Context?

```
an email thread with a lead               → EmailThread
a single email in a thread                → EmailMessage
a rule that escalates to human            → EscalationTrigger
```

## MinionTypes
```ts
// email-thread — lead, subject, status, message count, detected intent/sentiment
// email-message — direction (inbound/outbound), body, parsed intent, sentiment
// escalation-trigger — condition (call-requested/order/negative-sentiment), action
```

## Agent SKILLS
```markdown
# ConversationAgent Skills
## Skill: Parse Reply — detect intent and sentiment from inbound emails
## Skill: Handle Escalation — route to human when triggers fire
## Hard Rules — every inbound email must be parsed for intent
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-conversations/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
conversations types list
conversations types show <type-slug>
```

### CRUD

```bash
conversations create <type> -t "Title" -s "status"
conversations list <type>
conversations show <id>
conversations update <id> --data '{ "status": "active" }'
conversations delete <id>
conversations search "query"
```

### Stats & Validation

```bash
conversations stats
conversations validate ./my-minion.json
```
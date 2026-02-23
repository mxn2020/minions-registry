---
name: minions-test-runs
id: OC-0168
version: 1.0.0
description: "Execution records, turn-by-turn logs, and assertion results"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-test-runs — Agent Skills

## What is a Test Run in the Minions Context?

```
an execution of a test scenario           → TestRun
a single conversational turn              → TurnLog
```

## MinionTypes
```ts
// test-run — scenario, target, status, pass/fail counts, prompt version
// turn-log — turn index, user message, agent response, response time, assertions
```

## Agent SKILLS
```markdown
# RunnerAgent Skills
## Skill: Execute Run — send turns, capture responses, evaluate assertions
## Hard Rules — every turn must be logged, no silent failures
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-test-runs/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
test-runs types list
test-runs types show <type-slug>
```

### CRUD

```bash
test-runs create <type> -t "Title" -s "status"
test-runs list <type>
test-runs show <id>
test-runs update <id> --data '{ "status": "active" }'
test-runs delete <id>
test-runs search "query"
```

### Stats & Validation

```bash
test-runs stats
test-runs validate ./my-minion.json
```
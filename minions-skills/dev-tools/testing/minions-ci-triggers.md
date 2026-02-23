---
name: minions-ci-triggers
id: OC-0110
version: 1.0.0
description: "Code/prompt change listeners, CI/CD hooks, and regression gate definitions"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-ci-triggers — Agent Skills

## What is a CI Trigger in the Minions Context?

```
a trigger for automated test execution    → CiTrigger
a quality gate blocking deployment        → RegressionGate
```

## MinionTypes
```ts
// ci-trigger — trigger type (push/prompt-change/schedule), watch path, target
// regression-gate — metric, threshold, action (block/warn/notify)
```

## Agent SKILLS
```markdown
# CIAgent Skills
## Skill: Watch Changes — listen for code/prompt changes
## Skill: Enforce Gates — block deploys on regression
## Hard Rules — every prompt change must trigger a test run
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-ci-triggers/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
ci-triggers types list
ci-triggers types show <type-slug>
```

### CRUD

```bash
ci-triggers create <type> -t "Title" -s "status"
ci-triggers list <type>
ci-triggers show <id>
ci-triggers update <id> --data '{ "status": "active" }'
ci-triggers delete <id>
ci-triggers search "query"
```

### Stats & Validation

```bash
ci-triggers stats
ci-triggers validate ./my-minion.json
```
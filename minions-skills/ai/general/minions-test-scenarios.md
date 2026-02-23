---
name: minions-test-scenarios
id: OC-0169
version: 1.0.0
description: "Conversation scripts, tester personas, edge cases, and golden datasets"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-test-scenarios — Agent Skills

## What is a Test Scenario in the Minions Context?

```
a multi-turn conversation test            → TestScenario
a simulated user persona                  → TesterPersona
expected input-output pairs               → GoldenDataset
```

AI-as-Tester: the ScenarioAgent dynamically converses with the agent-under-test.

## MinionTypes
```ts
// test-scenario — name, turns, expected outcome, difficulty, tags
// tester-persona — traits, communication style, technical level
// golden-dataset — curated expected pairs for regression testing
```

## Agent SKILLS
```markdown
# ScenarioAgent Skills
## Skill: Design Scenario — create multi-turn test with assertions
## Skill: Run AI-as-Tester — dynamically converse using persona
## Hard Rules — every scenario must have expected outcomes defined
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-test-scenarios/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
test-scenarios types list
test-scenarios types show <type-slug>
```

### CRUD

```bash
test-scenarios create <type> -t "Title" -s "status"
test-scenarios list <type>
test-scenarios show <id>
test-scenarios update <id> --data '{ "status": "active" }'
test-scenarios delete <id>
test-scenarios search "query"
```

### Stats & Validation

```bash
test-scenarios stats
test-scenarios validate ./my-minion.json
```
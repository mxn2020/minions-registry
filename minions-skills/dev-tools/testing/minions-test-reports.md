---
name: minions-test-reports
id: OC-0167
version: 1.0.0
description: "Aggregated results, regression diffs, quality trends, and coverage maps"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-test-reports — Agent Skills

## What is a Test Report in the Minions Context?

```
an aggregated report across runs          → TestReport
a detected regression between periods     → RegressionDiff
```

## MinionTypes
```ts
// test-report — target, period, total runs, pass rate, avg latency, regressions
// regression-diff — metric, previous vs current value, severity
```

## Agent SKILLS
```markdown
# ReporterAgent Skills
## Skill: Generate Report — aggregate runs into period reports
## Skill: Detect Regressions — compare reports, flag degradations
## Hard Rules — regressions above threshold block CI gates
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-test-reports/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
test-reports types list
test-reports types show <type-slug>
```

### CRUD

```bash
test-reports create <type> -t "Title" -s "status"
test-reports list <type>
test-reports show <id>
test-reports update <id> --data '{ "status": "active" }'
test-reports delete <id>
test-reports search "query"
```

### Stats & Validation

```bash
test-reports stats
test-reports validate ./my-minion.json
```
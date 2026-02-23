---
name: minions-test-observability
id: OC-0166
version: 1.0.0
description: "Trace capture, tool call logs, reasoning timings, and latency breakdowns"
category: dev-tools
subcategory: testing
tags: ["minion", "dev-tools", "testing"]
comments:
---

# minions-test-observability — Agent Skills

## What is a Test Observability in the Minions Context?

```
a full execution trace from a test run    → TestTrace
timing breakdown by phase                 → LatencyBreakdown
```

## MinionTypes
```ts
// test-trace — run ID, steps, total duration, token count, tool call count
// latency-breakdown — phase name, duration, percentage of total
```

## Agent SKILLS
```markdown
# TraceAgent Skills
## Skill: Capture Trace — record full execution path per run
## Skill: Analyze Latency — break down time per phase
## Hard Rules — traces are immutable after capture
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-test-observability/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
test-observability types list
test-observability types show <type-slug>
```

### CRUD

```bash
test-observability create <type> -t "Title" -s "status"
test-observability list <type>
test-observability show <id>
test-observability update <id> --data '{ "status": "active" }'
test-observability delete <id>
test-observability search "query"
```

### Stats & Validation

```bash
test-observability stats
test-observability validate ./my-minion.json
```
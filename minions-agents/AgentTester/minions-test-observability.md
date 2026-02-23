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

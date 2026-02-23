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

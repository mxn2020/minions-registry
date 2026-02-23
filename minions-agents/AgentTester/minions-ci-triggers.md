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

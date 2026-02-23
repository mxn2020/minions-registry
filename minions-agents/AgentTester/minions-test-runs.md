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

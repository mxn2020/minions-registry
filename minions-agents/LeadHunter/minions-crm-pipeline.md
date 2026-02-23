## What is a CRM Pipeline in the Minions Context?

```
a potential or active deal                → Deal
a stage transition                        → DealTransition
a periodic revenue forecast               → RevenueForecast
```

## MinionTypes
```ts
// deal — lead, service, value, stage, probability, expected close date
// deal-transition — from/to stage, reason, changed by
// revenue-forecast — period, total pipeline, weighted forecast
```

## Agent SKILLS
```markdown
# PipelineAgent Skills
## Skill: Advance Deal — move through stages based on conversation signals
## Skill: Forecast Revenue — weighted projection from pipeline
## Hard Rules — every stage change must log a deal-transition
```

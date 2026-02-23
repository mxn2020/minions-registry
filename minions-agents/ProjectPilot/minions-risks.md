## What is a Risk in the Minions Context?

```
an identified project risk                → Risk
a status update on a tracked risk         → RiskUpdate
```

## MinionTypes
```ts
// risk — title, likelihood, impact, risk score, mitigation plan, owner
// risk-update — periodic reassessment of likelihood and impact
```

## Relations
```
risk              --belongs_to-->        project (minions-projects)
risk              --updated_by-->        risk-update
risk              --mitigated_via-->     task (minions-tasks)
```

## Agent SKILLS
```markdown
# RiskAgent Skills
## Skill: Identify Risks — scan project state for new risks
## Skill: Update Risk Register — periodic risk-update Minions
## Hard Rules — high-impact risks require mitigation plans within 24h
```

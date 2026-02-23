## What is a Decision in the Minions Context?

```
a logged project decision                 → Decision
a retrospective review                    → DecisionReview
```

## MinionTypes
```ts
// decision — title, rationale, alternatives, outcome, decided by/at
// decision-review — reviewed later: was it correct? lessons learned?
```

## Relations
```
decision          --belongs_to-->        project (minions-projects)
decision          --reviewed_by-->       decision-review
decision          --may_require-->       approval-request (minions-approvals)
```

## Agent SKILLS
```markdown
# DecisionAgent Skills
## Skill: Log Decision — capture rationale, alternatives, outcome
## Skill: Review Past Decisions — periodic retrospective
## Hard Rules — all irreversible decisions require approval first
```

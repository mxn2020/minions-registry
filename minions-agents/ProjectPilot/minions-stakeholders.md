## What is a Stakeholder in the Minions Context?

```
a project stakeholder                     → Stakeholder
a communication sent to a stakeholder     → StakeholderUpdate
```

## MinionTypes
```ts
// stakeholder — name, role, influence, interest, communication pref
// stakeholder-update — type (status, milestone, risk), summary, channel
```

## Relations
```
stakeholder       --belongs_to-->        project (minions-projects)
stakeholder       --receives-->          stakeholder-update
stakeholder       --linked_to-->         contact (minions-contacts)
```

## Agent SKILLS
```markdown
# StakeholderAgent Skills
## Skill: Map Stakeholders — identify, classify by influence/interest
## Skill: Send Updates — periodic stakeholder-update via preferred channel
## Hard Rules — high-influence stakeholders get updates on every milestone
```

## What is a Milestone in the Minions Context?

```
a major project checkpoint                → Milestone
a health check on progress                → MilestoneCheck
```

## MinionTypes
```ts
// milestone — name, due date, completion criteria, dependencies
// milestone-check — periodic on-track assessment with blockers
```

## Relations
```
milestone         --belongs_to-->        project (minions-projects)
milestone         --depends_on-->        milestone
milestone         --checked_by-->        milestone-check
milestone         --has_tasks-->         task (minions-tasks)
```

## Agent SKILLS
```markdown
# MilestoneAgent Skills
## Skill: Track Milestones — check progress, flag at-risk items
## Skill: Create Health Checks — periodic milestone-check Minions
## Hard Rules — milestones with dependencies can't complete before deps
```

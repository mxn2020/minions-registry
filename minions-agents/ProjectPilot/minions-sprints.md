## What is a Sprint in the Minions Context?

```
a time-boxed iteration                    → Sprint
lessons from a completed sprint           → SprintRetrospective
```

Only used by `it-project` variant in ProjectPilot.

## MinionTypes
```ts
// sprint — number, dates, goal, planned/completed story points
// sprint-retrospective — went well, needs improvement, action items
```

## Relations
```
sprint            --belongs_to-->        project (minions-projects, variant=it-project)
sprint            --contains-->          task (minions-tasks)
sprint            --reflected_in-->      sprint-retrospective
```

## Agent SKILLS
```markdown
# SprintAgent Skills
## Skill: Plan Sprint — select tasks, set goal, estimate points
## Skill: Close Sprint — calculate velocity, create retrospective
## Hard Rules — sprints cannot overlap for the same project
```

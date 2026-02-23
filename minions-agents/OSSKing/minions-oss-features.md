## What is an Feature in the Minions Context?

```
a feature in the backlog                  → Feature
a step-by-step implementation plan        → ImplementationPlan
```

The daily loop picks one feature per active project.

## MinionTypes
```ts
// feature — title, acceptance criteria, complexity, priority, selected date
// implementation-plan — steps, estimated hours, files affected, tests
```

## Relations
```
feature           --belongs_to-->        oss-project (minions-oss-projects)
feature           --planned_by-->        implementation-plan
feature           --released_in-->       release (minions-oss-releases)
```

## Agent SKILLS
```markdown
# FeatureAgent Skills
## Skill: Select Daily Feature — pick highest-priority feature per project
## Skill: Plan Implementation — create step-by-step plan
## Hard Rules — one feature per project per day, no parallel features
```

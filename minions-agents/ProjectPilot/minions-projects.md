## What is a Project in the Minions Context?

```
a project with goals and a variant        → Project
a periodic health summary                 → ProjectSummary
```

**Variants:** `it-project`, `personal-project`, `creative-project`, `business-project` — each variant activates different shared toolboxes.

## MinionTypes
```ts
// project — name, variant, goals, status, owner, dates
// project-summary — periodic health + completion % + blockers
```
See TOML for full fields.

## Relations
```
project           --has_milestone-->     milestone (minions-milestones)
project           --has_sprint-->        sprint (minions-sprints, it-project only)
project           --tracked_by-->        project-summary
project           --has_decision-->      decision (minions-decisions)
project           --has_risk-->          risk (minions-risks)
project           --has_stakeholder-->   stakeholder (minions-stakeholders)
```

## Agent SKILLS
```markdown
# ProjectAgent Skills
## Skill: Create Project — define variant, goals, timeline, owner
## Skill: Generate Summary — assess health, blockers, completion
## Hard Rules — never delete projects, only archive
```

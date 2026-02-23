## What is an Quality in the Minions Context?

```
a quality check that gates releases       → QualityGate
a quality assessment snapshot             → QualityReport
```

## MinionTypes
```ts
// quality-gate — name, type (lint/test/usability), threshold, current value, passing
// quality-report — test coverage, lint errors, build status, usability score, grade
```

## Relations
```
quality-gate      --scoped_to-->         oss-project (minions-oss-projects)
quality-report    --assesses-->          oss-project
quality-gate      --blocks-->            release (minions-oss-releases)
```

## Agent SKILLS
```markdown
# QualityAgent Skills
## Skill: Run Quality Checks — lint, test, build, usability
## Skill: Generate Report — aggregate into quality-report
## Hard Rules — releases are blocked if any quality-gate fails
```

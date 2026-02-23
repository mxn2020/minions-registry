---
name: minions-oss-quality
id: OC-0139
version: 1.0.0
description: "Linting rules, test coverage targets, usability checklists, and release gates"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-oss-quality — Agent Skills

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


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-oss-quality/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
oss-quality types list
oss-quality types show <type-slug>
```

### CRUD

```bash
oss-quality create <type> -t "Title" -s "status"
oss-quality list <type>
oss-quality show <id>
oss-quality update <id> --data '{ "status": "active" }'
oss-quality delete <id>
oss-quality search "query"
```

### Stats & Validation

```bash
oss-quality stats
oss-quality validate ./my-minion.json
```
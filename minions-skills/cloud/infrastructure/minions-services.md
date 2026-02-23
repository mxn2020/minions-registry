---
name: minions-services
id: OC-0157
version: 1.0.0
description: "Service catalog, packages, pricing tiers, case studies, and target industries"
category: cloud
subcategory: infrastructure
tags: ["minion", "cloud", "infrastructure"]
comments:
---

# minions-services — Agent Skills

## What is a Service in the Minions Context?

```
a service offered by the agency           → Service
a bundled service package                 → ServicePackage
a success story                           → CaseStudy
```

## MinionTypes
```ts
// service — name, category, pricing model, base price, target industries
// service-package — bundled services with total price and discount
// case-study — challenge, solution, results, published URL
```

## Agent SKILLS
```markdown
# ServiceAgent Skills
## Skill: Manage Catalog — create/update services and packages
## Skill: Match Services — find best service for a prospect's needs
## Hard Rules — pricing must be consistent across packages
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-services/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
services types list
services types show <type-slug>
```

### CRUD

```bash
services create <type> -t "Title" -s "status"
services list <type>
services show <id>
services update <id> --data '{ "status": "active" }'
services delete <id>
services search "query"
```

### Stats & Validation

```bash
services stats
services validate ./my-minion.json
```
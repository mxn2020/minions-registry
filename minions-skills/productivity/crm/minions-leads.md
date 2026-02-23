---
name: minions-leads
id: OC-0128
version: 1.0.0
description: "Lead records, company profiles, contact details, and qualification status"
category: productivity
subcategory: crm
tags: ["minion", "productivity", "crm"]
comments:
---

# minions-leads — Agent Skills

## What is a Lead in the Minions Context?

```
a discovered potential client             → Lead
additional enrichment data                → LeadEnrichment
```

## MinionTypes
```ts
// lead — company, website, industry, territory, contact info, lead score, status
// lead-enrichment — company size, revenue, tech stack, social profiles
```

## Agent SKILLS
```markdown
# LeadAgent Skills
## Skill: Qualify Leads — score, deduplicate, enrich
## Skill: Enrich Lead — research company details, tech stack, socials
## Hard Rules — leads must be deduplicated before entering pipeline
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-leads/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
leads types list
leads types show <type-slug>
```

### CRUD

```bash
leads create <type> -t "Title" -s "status"
leads list <type>
leads show <id>
leads update <id> --data '{ "status": "active" }'
leads delete <id>
leads search "query"
```

### Stats & Validation

```bash
leads stats
leads validate ./my-minion.json
```
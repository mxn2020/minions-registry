---
name: minions-territories
id: OC-0165
version: 1.0.0
description: "Country, state, region, city definitions, focus queue, and saturation tracking"
category: productivity
subcategory: sales
tags: ["minion", "productivity", "sales"]
comments:
---

# minions-territories — Agent Skills

## What is a Territory in the Minions Context?

```
a geographic area for prospecting         → Territory
saturation metrics for a territory        → TerritorySaturation
the ordered queue of territories          → FocusQueue
```

Geo hierarchy: Country → State → Region → City

## MinionTypes
```ts
// territory — name, level, parent, country/state/region/city, estimated businesses
// territory-saturation — total prospects, contacted, reply/conversion rates
// focus-queue — ordered list of territory IDs with current index
```

## Agent SKILLS
```markdown
# TerritoryAgent Skills
## Skill: Manage Focus Queue — rotate through territories by saturation
## Skill: Track Saturation — update metrics after each outreach cycle
## Hard Rules — move to next territory when saturation exceeds threshold
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-territories/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
territories types list
territories types show <type-slug>
```

### CRUD

```bash
territories create <type> -t "Title" -s "status"
territories list <type>
territories show <id>
territories update <id> --data '{ "status": "active" }'
territories delete <id>
territories search "query"
```

### Stats & Validation

```bash
territories stats
territories validate ./my-minion.json
```
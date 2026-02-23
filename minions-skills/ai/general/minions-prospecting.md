---
name: minions-prospecting
id: OC-0146
version: 1.0.0
description: "Web search configs, prospect discovery rules, and lead scoring criteria"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-prospecting — Agent Skills

## What is a Prospecting in the Minions Context?

```
a web search configuration               → SearchConfig
a rule for qualifying prospects           → DiscoveryRule
criteria for scoring leads                → ScoringCriteria
```

## MinionTypes
```ts
// search-config — territory, query, search engine, industry, max results
// discovery-rule — condition, score contribution
// scoring-criteria — field, weight, direction
```

## Agent SKILLS
```markdown
# ProspectAgent Skills
## Skill: Run Search — execute web searches per territory + industry
## Skill: Qualify Prospects — apply discovery rules and scoring
## Hard Rules — never contact a prospect without qualification scoring
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-prospecting/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
prospecting types list
prospecting types show <type-slug>
```

### CRUD

```bash
prospecting create <type> -t "Title" -s "status"
prospecting list <type>
prospecting show <id>
prospecting update <id> --data '{ "status": "active" }'
prospecting delete <id>
prospecting search "query"
```

### Stats & Validation

```bash
prospecting stats
prospecting validate ./my-minion.json
```
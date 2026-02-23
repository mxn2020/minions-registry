---
name: minions-social-research
id: OC-0160
version: 1.0.0
description: "Trend sources, competitor snapshots, hashtag sets, and audience notes"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-social-research — Agent Skills

## What is Social Research in the Minions Context?

```
a configured trend source                  → TrendSource
a competitor snapshot                       → CompetitorSnapshot
a curated hashtag set                       → HashtagSet
an observed audience insight                → AudienceInsight
```

---

## MinionTypes

```ts
// trend-source — feeds into content planning
// competitor-snapshot — point-in-time capture
// hashtag-set — curated per theme/platform
// audience-insight — observed pattern with confidence
```

See TOML for full field definitions.

---

## Relations

```
trend-source       --informs-->          content-calendar (minions-content-plans)
competitor-snapshot --compared_to-->     social-account (minions-social-accounts)
hashtag-set        --used_in-->         text-post (minions-content-assets)
audience-insight   --scoped_to-->       account-group (minions-social-accounts)
```

---

## Agent SKILLS for `minions-social-research`

```markdown
# ResearchAgent Skills

## Skill: Scan Trends
1. Crawl active trend-sources
2. Create competitor-snapshots at regular intervals
3. Update hashtag-sets based on trending topics

## Skill: Generate Insights
1. Analyze engagement data across account groups
2. Create audience-insight Minions with confidence scores

## Hard Rules
- Competitors are snapshotted, never live-tracked
- Insights must cite their source data
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-social-research/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
social-research types list
social-research types show <type-slug>
```

### CRUD

```bash
social-research create <type> -t "Title" -s "status"
social-research list <type>
social-research show <id>
social-research update <id> --data '{ "status": "active" }'
social-research delete <id>
social-research search "query"
```

### Stats & Validation

```bash
social-research stats
social-research validate ./my-minion.json
```
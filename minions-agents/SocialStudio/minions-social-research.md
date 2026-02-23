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

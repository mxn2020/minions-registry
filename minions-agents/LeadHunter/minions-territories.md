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

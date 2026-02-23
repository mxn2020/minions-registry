---
name: minions-content-publishing
id: OC-0117
version: 1.0.0
description: "Publish queue, delivery receipts, and mode configuration"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-content-publishing — Agent Skills

## What is Content Publishing in the Minions Context?

```
a job to publish a bundle to a platform    → PublishJob
confirmation of successful posting         → DeliveryReceipt
post-publish engagement metrics            → EngagementSnapshot
```

---

## MinionTypes

```ts
// publish-job — queued posting with approval status
// delivery-receipt — confirmation with platform URL + post ID
// engagement-snapshot — likes, comments, shares, views over time
```

See TOML for full field definitions.

---

## Relations

```
publish-job        --creates-->          delivery-receipt
delivery-receipt   --tracked_by-->       engagement-snapshot
publish-job        --publishes-->        asset-bundle (minions-content-assets)
```

---

## Agent SKILLS for `minions-content-publishing`

```markdown
# PublisherAgent Skills

## Skill: Publish Bundle
1. Load approved publish-job and asset-bundle
2. Post to target platform API
3. Create delivery-receipt with URL

## Skill: Track Engagement
1. Periodically snapshot engagement metrics for recent posts
2. Create engagement-snapshot Minions

## Hard Rules
- Never publish without approval
- Every failed publish creates a retry task
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-content-publishing/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
content-publishing types list
content-publishing types show <type-slug>
```

### CRUD

```bash
content-publishing create <type> -t "Title" -s "status"
content-publishing list <type>
content-publishing show <id>
content-publishing update <id> --data '{ "status": "active" }'
content-publishing delete <id>
content-publishing search "query"
```

### Stats & Validation

```bash
content-publishing stats
content-publishing validate ./my-minion.json
```
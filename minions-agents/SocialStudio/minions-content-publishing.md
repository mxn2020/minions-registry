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

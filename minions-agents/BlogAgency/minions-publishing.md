## What is Publishing in the Minions Context?

Before defining types, it's worth being precise:

```
a platform where articles are published    → PublishTarget
an article queued for publishing           → PublishQueueEntry
confirmation of a successful publish       → PublishReceipt
a cross-posted version of an article       → CrossPost
```

---

## MinionTypes

**Core**
```ts
// publish-target
{
  type: "publish-target",
  fields: {
    blogId: string,
    platform: "wordpress" | "ghost" | "medium" | "hashnode" | "custom",
    name: string,
    apiEndpoint: string,
    authMethod: "api-key" | "oauth" | "token",
    isActive: boolean,
    lastPublishedAt: datetime
  }
}

// publish-queue-entry
{
  type: "publish-queue-entry",
  fields: {
    articleId: string,
    publishTargetId: string,
    scheduledAt: datetime,
    status: "queued" | "publishing" | "published" | "failed",
    priority: "urgent" | "normal" | "low",
    approvalRequestId: string
  }
}

// publish-receipt
{
  type: "publish-receipt",
  fields: {
    articleId: string,
    publishTargetId: string,
    publishedAt: datetime,
    publishedUrl: string,
    platformPostId: string,
    status: "live" | "unlisted" | "removed"
  }
}

// cross-post
{
  type: "cross-post",
  fields: {
    articleId: string,
    originalReceiptId: string,
    targetPlatform: string,
    publishedUrl: string,
    publishedAt: datetime,
    status: "published" | "pending" | "failed"
  }
}
```

---

## Relations

```
publish-target       --receives-->       publish-queue-entry
publish-queue-entry  --produces-->       publish-receipt
publish-receipt      --spawns-->         cross-post
article (minions-articles) --queued_to--> publish-queue-entry
```

---

## How It Connects to Other Toolboxes

```
minions-articles     → approved articles enter the publish queue
minions-blogs        → publish targets are scoped to a blog
minions-approvals    → scheduled publishes may require approval
minions-scheduler    → publish times are driven by scheduler
minions-comms        → publish success/failure triggers notifications
```

---

## Agent SKILLS for `minions-publishing`

```markdown
# PublisherAgent Skills

## Context
You manage the publishing pipeline. You take approved articles,
queue them for publication, execute the publish, and track receipts.

## Skill: Queue Article
1. Receive approved article from WriterAgent
2. Create publish-queue-entry with target and schedule
3. If approval required, create approval-request first

## Skill: Execute Publish
1. At scheduled time: load queue entry and article content
2. Call publish-target API to create post
3. Create publish-receipt with URL and platform ID
4. Update queue entry status to "published"

## Skill: Cross-Post
1. After primary publish: check cross-post rules
2. For each secondary platform: create cross-post entry
3. Publish with canonical URL pointing to primary

## Hard Rules
- Never publish without a publish-receipt
- Always set canonical URL on cross-posts
- Failed publishes create retry tasks, not silent failures
```

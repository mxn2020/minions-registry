---
name: minions-content-assets
id: OC-0115
version: 1.0.0
description: "Text posts, image briefs, video briefs, and generated asset references"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-content-assets — Agent Skills

## What is a Content Asset in the Minions Context?

```
a social media text post                   → TextPost
a brief for generating an image            → ImageBrief
a brief for generating a video             → VideoBrief
a combined package ready for publishing    → AssetBundle
```

---

## MinionTypes

```ts
// text-post
{
  type: "text-post",
  fields: {
    accountId: string,
    body: string,
    hashtags: string[],
    calendarSlotId: string,
    status: "draft" | "review" | "approved" | "published",
    generationMode: "prompt-only" | "api-generated",
    createdAt: datetime
  }
}

// image-brief / video-brief — prompts + style + generated refs
// asset-bundle — combines text + image + video for one calendar slot
```

See TOML for full field definitions.

---

## Relations

```
text-post          --bundled_in-->       asset-bundle
image-brief        --bundled_in-->       asset-bundle
video-brief        --bundled_in-->       asset-bundle
asset-bundle       --fills-->            calendar-slot (minions-content-plans)
asset-bundle       --published_via-->    publish-job (minions-content-publishing)
```

---

## Agent SKILLS for `minions-content-assets`

```markdown
# ContentAgent Skills

## Skill: Create Text Post
1. Load calendar-slot, account brand voice, and research insights
2. Generate text post (prompt-only or API-generated per mode config)
3. Add relevant hashtags from hashtag-sets

## Skill: Assemble Bundle
1. Combine text-post + image-brief + video-brief
2. Create asset-bundle linked to calendar-slot

## Hard Rules
- Every bundle must have at least a text-post
- Generation mode must match account's content-mode-config
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-content-assets/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
content-assets types list
content-assets types show <type-slug>
```

### CRUD

```bash
content-assets create <type> -t "Title" -s "status"
content-assets list <type>
content-assets show <id>
content-assets update <id> --data '{ "status": "active" }'
content-assets delete <id>
content-assets search "query"
```

### Stats & Validation

```bash
content-assets stats
content-assets validate ./my-minion.json
```
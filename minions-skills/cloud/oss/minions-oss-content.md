---
name: minions-oss-content
id: OC-0135
version: 1.0.0
description: "Blog post drafts, README updates, social announcements, and demo scripts"
category: cloud
subcategory: oss
tags: ["minion", "cloud", "oss"]
comments:
---

# minions-oss-content — Agent Skills

## What is an OSS Content in the Minions Context?

```
a blog post announcing a release          → ReleasePost
a tracked README update                   → ReadmeUpdate
a social media announcement               → SocialAnnouncement
a runnable demo script                    → DemoScript
```

## MinionTypes
```ts
// release-post — title, body, published URL
// readme-update — section, content, reason
// social-announcement — platform, body, status
// demo-script — title, script, output sample
```

## Relations
```
release-post       --announces-->        release (minions-oss-releases)
social-announcement --promotes-->        release
readme-update      --updates-->          oss-project (minions-oss-projects)
demo-script        --demonstrates-->     oss-project
```

## Agent SKILLS
```markdown
# ContentAgent Skills
## Skill: Write Release Post — blog post per release
## Skill: Update README — after each feature implementation
## Skill: Social Announcement — post to configured platforms
## Hard Rules — every release must have a release-post and README update
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-oss-content/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
oss-content types list
oss-content types show <type-slug>
```

### CRUD

```bash
oss-content create <type> -t "Title" -s "status"
oss-content list <type>
oss-content show <id>
oss-content update <id> --data '{ "status": "active" }'
oss-content delete <id>
oss-content search "query"
```

### Stats & Validation

```bash
oss-content stats
oss-content validate ./my-minion.json
```
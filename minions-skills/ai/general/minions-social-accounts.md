---
name: minions-social-accounts
id: OC-0159
version: 1.0.0
description: "Account definitions, platforms, namespaces/purposes, and API keys"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-social-accounts — Agent Skills

## What is a Social Account in the Minions Context?

```
a managed social media account              → SocialAccount
a logical grouping of accounts by purpose   → AccountGroup
per-account content generation mode config  → ContentModeConfig
```

---

## MinionTypes

```ts
// social-account
{
  type: "social-account",
  fields: {
    name: string,
    platform: "twitter" | "linkedin" | "instagram" | "tiktok" | "youtube" | "threads",
    handle: string,
    purpose: string,
    namespace: string,
    apiKeyRef: string,
    status: "active" | "paused" | "archived",
    createdAt: datetime
  }
}

// account-group
{
  type: "account-group",
  fields: {
    name: string,
    description: string,
    accountIds: string[],
    purpose: string,
    status: "active" | "archived"
  }
}

// content-mode-config
{
  type: "content-mode-config",
  fields: {
    accountId: string,
    textMode: "prompt-only" | "api-generated",
    imageMode: "prompt-only" | "api-generated" | "none",
    videoMode: "prompt-only" | "api-generated" | "none",
    isActive: boolean
  }
}
```

---

## Relations

```
social-account     --member_of-->        account-group
social-account     --configured_by-->    content-mode-config
account-group      --planned_in-->       content-calendar (minions-content-plans)
```

---

## How It Connects to Other Toolboxes

```
minions-content-plans       → calendars are scoped to account groups
minions-content-assets      → assets are created per account
minions-content-publishing  → publish jobs target specific accounts
minions-costs               → API generation costs tracked per account
```

---

## Agent SKILLS for `minions-social-accounts`

```markdown
# AccountAgent Skills

## Skill: Register Account
1. Create social-account with platform, handle, purpose
2. Set content-mode-config for text/image/video generation modes
3. Add to appropriate account-group

## Hard Rules
- Every account must have a content-mode-config
- Never delete accounts — archive them
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-social-accounts/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
social-accounts types list
social-accounts types show <type-slug>
```

### CRUD

```bash
social-accounts create <type> -t "Title" -s "status"
social-accounts list <type>
social-accounts show <id>
social-accounts update <id> --data '{ "status": "active" }'
social-accounts delete <id>
social-accounts search "query"
```

### Stats & Validation

```bash
social-accounts stats
social-accounts validate ./my-minion.json
```
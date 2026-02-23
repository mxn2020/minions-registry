---
name: minions-content-plans
id: OC-0116
version: 1.0.0
description: "Content calendars, themes, and posting schedules per account group"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-content-plans — Agent Skills

## What is a Content Plan in the Minions Context?

```
a time-bound content calendar               → ContentCalendar
a specific posting slot                     → CalendarSlot
recurring posting rules                     → PostingSchedule
```

---

## MinionTypes

```ts
// content-calendar
{
  type: "content-calendar",
  fields: {
    accountGroupId: string,
    name: string,
    periodStart: datetime,
    periodEnd: datetime,
    theme: string,
    status: "draft" | "active" | "completed",
    createdAt: datetime
  }
}

// calendar-slot
{
  type: "calendar-slot",
  fields: {
    calendarId: string,
    accountId: string,
    scheduledAt: datetime,
    contentType: "text" | "image" | "video" | "carousel",
    assetId: string,
    status: "empty" | "filled" | "published"
  }
}

// posting-schedule
{
  type: "posting-schedule",
  fields: {
    accountId: string,
    dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    timeOfDay: string,
    contentType: "text" | "image" | "video",
    frequency: "daily" | "weekly" | "biweekly",
    isActive: boolean
  }
}
```

---

## Relations

```
content-calendar   --contains-->         calendar-slot
calendar-slot      --filled_by-->        asset-bundle (minions-content-assets)
posting-schedule   --generates-->        calendar-slot
```

---

## Agent SKILLS for `minions-content-plans`

```markdown
# PlannerAgent Skills

## Skill: Create Calendar
1. Define period, theme, and account group
2. Generate calendar-slots from posting-schedules
3. Set calendar status to "draft" for review

## Hard Rules
- Every slot must map to exactly one account + time
- Calendars are never deleted — only completed or archived
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-content-plans/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
content-plans types list
content-plans types show <type-slug>
```

### CRUD

```bash
content-plans create <type> -t "Title" -s "status"
content-plans list <type>
content-plans show <id>
content-plans update <id> --data '{ "status": "active" }'
content-plans delete <id>
content-plans search "query"
```

### Stats & Validation

```bash
content-plans stats
content-plans validate ./my-minion.json
```
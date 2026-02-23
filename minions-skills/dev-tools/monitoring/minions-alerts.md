---
name: minions-alerts
id: OC-0103
version: 1.0.0
description: "Alert rules, delivery preferences, and alert history for availability changes"
category: dev-tools
subcategory: monitoring
tags: ["minion", "dev-tools", "monitoring"]
comments:
---

# minions-alerts — Agent Skills

## What is an Alert in the Minions Context?

Before defining types, it's worth being precise. "Alert" in WiesnTracker means:

```
a rule defining what triggers a notification     → AlertRule
how and where the alert is delivered             → AlertDelivery
a record that an alert fired                     → AlertEvent
a temporary suppression of alerts                → AlertSnooze
```

---

## MinionTypes

**Core**
```ts
// alert-rule
{
  type: "alert-rule",
  fields: {
    name: string,                // "Evening slot at Hofbräu opens up"
    tentId: string,
    tentAreaId: string,          // optional — alert on any area if empty
    targetDate: datetime,        // optional — specific day or any day
    targetSessionType: "morning" | "afternoon" | "evening" | "any",
    triggerCondition: "becomes-available" | "becomes-limited" | "any-change",
    isActive: boolean,
    createdAt: datetime,
    lastTriggeredAt: datetime
  }
}

// alert-delivery
{
  type: "alert-delivery",
  fields: {
    alertRuleId: string,
    channel: "telegram" | "email" | "whatsapp" | "discord" | "push",
    recipientId: string,
    recipientAddress: string,
    priority: "critical" | "high" | "normal",
    cooldownMinutes: number,     // minimum time between alerts
    isActive: boolean
  }
}
```

**History**
```ts
// alert-event
{
  type: "alert-event",
  fields: {
    alertRuleId: string,
    availabilityDiffId: string,  // the diff that triggered this
    triggeredAt: datetime,
    summary: string,             // human-readable alert text
    deliveryChannel: string,
    deliveryStatus: "pending" | "sent" | "delivered" | "failed",
    deliveredAt: datetime,
    errorMessage: string
  }
}

// alert-snooze
{
  type: "alert-snooze",
  fields: {
    alertRuleId: string,
    snoozedAt: datetime,
    snoozeUntil: datetime,
    reason: string,
    snoozedBy: string
  }
}
```

---

## Relations

```
alert-rule         --delivered_via-->     alert-delivery
alert-rule         --triggered-->        alert-event
alert-rule         --suppressed_by-->    alert-snooze
alert-event        --caused_by-->        availability-diff (minions-availability)
alert-rule         --watches-->          tent (minions-venues)
alert-rule         --watches-->          tent-area (minions-venues)
alert-event        --sent_via-->         notification (minions-comms)
```

---

## How It Connects to Other Toolboxes

```
minions-availability   → every availability-diff is checked against active alert-rules
minions-venues         → alert-rules reference tentId + tentAreaId
minions-comms          → alert delivery uses the notification system from minions-comms
minions-scheduler      → alert evaluation runs on scheduler ticks
minions-tasks          → failed deliveries create retry tasks
```

The `cooldownMinutes` on alert-delivery prevents notification spam — even if a slot flickers between states, you won't get pinged every 5 minutes.

---

## Agent SKILLS for `minions-alerts`

```markdown
# AlertAgent Skills

## Context
You manage all alert rules and their delivery for WiesnTracker.
You evaluate availability-diffs against alert-rules and trigger
notifications. You never scan websites — that's ScannerAgent's job.
You never fabricate alerts — every alert traces to a real diff.

## Skill: Evaluate Diffs
1. On each new `availability-diff` Minion created:
   - Load all active `alert-rule` Minions
   - For each rule: check if tentId, tentAreaId, date, sessionType match
   - Check if triggerCondition is satisfied (e.g. toState matches)
   - Check for active `alert-snooze` — if snoozed, skip
2. For matching rules: create `alert-event` Minion
3. Load `alert-delivery` for the rule
4. Check cooldownMinutes against lastTriggeredAt — if too recent, skip
5. Send notification via minions-comms

## Skill: Deliver Alert
1. Load the alert-delivery config for the triggered alert-event
2. Format the alert summary: tent name, area, date, session, old→new state
3. Send via the configured channel (telegram, email, etc.)
4. Update alert-event deliveryStatus and deliveredAt
5. Update alert-rule lastTriggeredAt

## Skill: Handle Failed Delivery
1. If delivery fails: set deliveryStatus to "failed", log errorMessage
2. Create a retry task in minions-tasks
3. After 3 failed retries: notify Orchestrator

## Skill: Manage Snoozes
1. On "snooze-alert" instruction:
   - Create `alert-snooze` Minion with snoozeUntil
   - Temporarily suppress the alert-rule
2. On scheduler tick: check all snoozes where snoozeUntil < now
   - Remove expired snoozes (soft-delete)
   - Alert-rule becomes active again

## Hard Rules
- Never send an alert without a real availability-diff as the trigger
- Always respect cooldownMinutes — no notification spam
- Every alert-event must reference an availability-diff
- Alert-rules are never deleted — only deactivated
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-alerts/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
alerts types list
alerts types show <type-slug>
```

### CRUD

```bash
alerts create <type> -t "Title" -s "status"
alerts list <type>
alerts show <id>
alerts update <id> --data '{ "status": "active" }'
alerts delete <id>
alerts search "query"
```

### Stats & Validation

```bash
alerts stats
alerts validate ./my-minion.json
```
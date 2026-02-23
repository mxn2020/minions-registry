## What is Availability in the Minions Context?

Before defining types, it's worth being precise. "Availability" in WiesnTracker spans:

```
a point-in-time snapshot of what's open     → AvailabilitySnapshot
the current state of a specific slot        → SlotState
a detected change between two snapshots     → AvailabilityDiff
how and when to check for changes           → ScanConfig
```

---

## MinionTypes

**Core**
```ts
// availability-snapshot
{
  type: "availability-snapshot",
  fields: {
    tentId: string,
    tentAreaId: string,
    capturedAt: datetime,
    date: datetime,             // the Wiesn day being checked
    sessionType: "morning" | "afternoon" | "evening",
    slotsTotal: number,
    slotsAvailable: number,
    slotsBlocked: number,
    status: "available" | "limited" | "full" | "unknown",
    rawHtml: string             // preserved for debugging
  }
}

// slot-state
{
  type: "slot-state",
  fields: {
    tentId: string,
    tentAreaId: string,
    date: datetime,
    sessionType: "morning" | "afternoon" | "evening",
    state: "available" | "limited" | "full" | "not-yet-open" | "closed",
    lastCheckedAt: datetime,
    lastChangedAt: datetime,
    previousState: string
  }
}

// availability-diff
{
  type: "availability-diff",
  fields: {
    tentId: string,
    tentAreaId: string,
    date: datetime,
    sessionType: "morning" | "afternoon" | "evening",
    fromState: string,
    toState: string,
    detectedAt: datetime,
    snapshotBeforeId: string,
    snapshotAfterId: string
  }
}
```

**Scanning**
```ts
// scan-config
{
  type: "scan-config",
  fields: {
    tentId: string,
    scanIntervalMinutes: number,  // how often to check
    priority: "high" | "medium" | "low",
    isActive: boolean,
    lastScanAt: datetime,
    nextScanAt: datetime,
    errorCount: number,
    notes: string
  }
}
```

---

## Relations

```
availability-snapshot  --captures-->       slot-state
availability-diff     --compares-->       availability-snapshot (before + after)
availability-diff     --triggers-->       alert-event (minions-alerts)
scan-config           --targets-->        tent (minions-venues)
slot-state            --tracks-->         tent-area (minions-venues)
```

---

## How It Connects to Other Toolboxes

```
minions-venues      → ScannerAgent reads tent + tent-area to know what to scan
minions-alerts      → every availability-diff is evaluated against alert-rules
minions-scheduler   → scan-config nextScanAt is driven by minions-scheduler triggers
minions-tasks       → scan failures create investigation tasks
minions-comms       → scan results can trigger notifications (via alerts)
```

The `availability-diff` is the single most important type — it's the raw signal that drives the entire alert system. Every time a slot changes state (especially "full" → "available"), that diff triggers alerts and potentially notifications.

---

## Agent SKILLS for `minions-availability`

```markdown
# ScannerAgent Skills

## Context
You are ScannerAgent. You scan tent reservation websites for availability
changes. You produce snapshots, maintain slot states, and detect diffs.
You do not send alerts — that's AlertAgent's job. You only produce data.

## Skill: Execute Scan
1. Load active `scan-config` Minions where nextScanAt <= now
2. For each config: navigate to the tent's reservation URL via browser
3. Parse the availability table from the HTML
4. Create an `availability-snapshot` Minion with raw counts + rawHtml
5. Compare against the current `slot-state`:
   - If state changed: create `availability-diff` Minion
   - Update `slot-state` with new state + lastChangedAt
6. Update scan-config: lastScanAt = now, compute next nextScanAt
7. On error: increment errorCount, log task in minions-tasks

## Skill: Priority Scanning
1. When AlertAgent flags high-priority alert-rules for specific tents:
   - Temporarily boost scan-config priority to "high"
   - Reduce scanIntervalMinutes for targeted tents
2. When demand drops (no active alerts): reset to default interval

## Skill: Handle Scan Errors
1. If a scan fails 3 consecutive times:
   - Create a task in minions-tasks: "Investigate scan failure for [tent]"
   - Set scan-config priority to "low"
   - Notify Orchestrator
2. On recovery: reset errorCount, resume normal scanning

## Hard Rules
- Always preserve rawHtml in snapshots for debugging
- Never fabricate availability data — only report what is parsed
- Max scan frequency: 1 per 5 minutes per tent (respect rate limits)
- Every state change must produce an availability-diff
```

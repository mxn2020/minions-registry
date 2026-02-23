## What is a Venue in the Minions Context?

Before defining types, it's worth being precise. A "venue" in WiesnTracker means:

```
an Oktoberfest beer tent                 → Tent
a reservable section within a tent       → TentArea
the rules for booking that section       → ReservationRule
the daily schedule of opening hours      → OpeningSchedule
```

---

## MinionTypes

**Core**
```ts
// tent
{
  type: "tent",
  fields: {
    name: string,               // "Hofbräu-Festzelt"
    shortName: string,          // "Hofbräu"
    brewer: string,             // "Hofbräu München"
    totalSeats: number,
    standingCapacity: number,
    website: string,
    reservationUrl: string,
    category: "large" | "small" | "tradition",
    isLargeTent: boolean,
    status: "active" | "closed" | "archived"
  }
}

// tent-area
{
  type: "tent-area",
  fields: {
    tentId: string,
    name: string,               // "Galerie links", "Boxen Erdgeschoss"
    areaType: "box" | "gallery" | "terrace" | "biergarten" | "standing",
    seats: number,
    isIndoor: boolean,
    isEvening: boolean,         // true = only available for evening sessions
    minimumSpend: number,
    currency: string,
    notes: string
  }
}

// reservation-rule
{
  type: "reservation-rule",
  fields: {
    tentId: string,
    tentAreaId: string,
    minGroupSize: number,
    maxGroupSize: number,
    reservationOpenDate: datetime,
    reservationCloseDate: datetime,
    mustOrderFood: boolean,
    depositRequired: boolean,
    depositAmount: number,
    notes: string
  }
}

// opening-schedule
{
  type: "opening-schedule",
  fields: {
    tentId: string,
    date: datetime,             // specific Wiesn day
    openTime: string,           // "10:00"
    closeTime: string,          // "23:30"
    sessionType: "morning" | "afternoon" | "evening" | "full-day",
    isSpecialEvent: boolean,
    eventName: string           // "Anstich", "Italian Weekend", etc.
  }
}
```

---

## Relations

```
tent              --has_area-->          tent-area
tent              --has_rule-->          reservation-rule
tent              --has_schedule-->      opening-schedule
tent-area         --governed_by-->       reservation-rule
tent              --scanned_by-->        scan-config (minions-availability)
tent-area         --tracked_in-->        slot-state (minions-availability)
```

---

## How It Connects to Other Toolboxes

```
minions-availability   → ScannerAgent reads tent + tent-area definitions to know what to scan
minions-alerts         → alert-rules reference tentId + tentAreaId + sessionType
minions-scheduler      → scan schedules are triggered by minions-scheduler
minions-tasks          → manual research tasks (e.g. "verify reservation URL for Augustiner")
minions-taxonomy       → tent categories and area types could be managed as taxonomy entries
```

The `tent-area` granularity is critical — availability is tracked per area, not per tent. A tent can have slots fully booked in the Biergarten but still have gallery boxes available.

---

## Agent SKILLS for `minions-venues`

```markdown
# VenueAgent Skills

## Context
You manage all venue data for WiesnTracker. You maintain the tent registry,
their areas, reservation rules, and daily schedules. You are the source of
truth for what exists at Oktoberfest. You never fabricate data — everything
traces to the tent's official website.

## Skill: Register Tent
1. Create a `tent` Minion with all static metadata
2. For each reservable section, create a `tent-area` Minion
3. Create `reservation-rule` Minions for each area's booking constraints
4. Populate `opening-schedule` from the tent's published schedule
5. Emit "tent-registered" to Orchestrator

## Skill: Update Schedule
1. Annually before Wiesn: refresh all tent schedules from official sources
2. Create/update `opening-schedule` Minions for each tent × day
3. Flag any special events (Anstich, themed days)

## Skill: Track Rule Changes
1. Periodically check reservation URLs for updated rules
2. If rules change: update `reservation-rule` Minion, log the change
3. Notify AlertAgent if reservation windows open earlier than expected

## Hard Rules
- Never delete a tent — set status to "archived"
- Every tent-area must have at least one reservation-rule
- All data must trace to a verifiable source URL
```

## What is Taxonomy in the Minions Context?

Before defining types, it's worth being precise. "Taxonomy" in a system with 500+ MinionTypes can mean very different things:

```
how you group things by purpose        → MinionGroup
how you browse things hierarchically   → MinionCategory
how you label things freely            → MinionTag
who owns or originates a type          → MinionNamespace
what lifecycle stage something is in   → MinionStatus
how urgent or important something is   → MinionPriority
```

The key insight is that none of these are domain concepts — they are **meta-concepts**. They don't describe jobs, proposals, or agents. They describe *how you organize and navigate everything else*. That's what makes `minions-taxonomy` foundational.

---

## MinionTypes

**Grouping by Purpose**
```ts
// minion-group
// answers: "what things belong together for a shared goal?"
{
  type: "minion-group",
  fields: {
    name: string,              // "Freelance Job Hunter"
    description: string,       // what this group accomplishes together
    minionTypes: string[],     // ["job-posting", "job-signal", "match-score"]
    categoryId: string,        // optional parent category
    namespaceId: string,       // who owns this group
    tags: string[],
    status: "active" | "draft" | "archived"
  }
}
```

**Hierarchical Browsing**
```ts
// minion-category
// answers: "where does this live in the tree?"
{
  type: "minion-category",
  fields: {
    name: string,              // "Finance"
    parentCategoryId: string,  // null if root, else "Finance" > "Invoicing" > "LineItem"
    description: string,
    path: string,              // "finance/invoicing/line-item" — computed, for fast lookup
    icon: string,
    color: string,
    order: number              // display order among siblings
  }
}
```

**Freeform Labeling**
```ts
// minion-tag
// answers: "what traits does this have?"
{
  type: "minion-tag",
  fields: {
    name: string,              // "has-approval-flow", "ai-generated", "auditable"
    color: string,
    description: string,
    namespaceId: string,       // scopes the tag to an owner if needed
    isSystem: boolean          // true = created by toolbox, false = user-defined
  }
}

// minion-tag-assignment
// the actual link between a tag and any Minion instance
{
  type: "minion-tag-assignment",
  fields: {
    tagId: string,
    targetType: string,        // "job-posting", "task", "agent-definition"
    targetId: string,
    assignedAt: datetime,
    assignedBy: string
  }
}
```

**Ownership and Origin**
```ts
// minion-namespace
// answers: "who owns or produced this set of types?"
{
  type: "minion-namespace",
  fields: {
    name: string,              // "system", "user", "toolbox:minions-jobs"
    owner: string,
    ownerType: "system" | "user" | "toolbox" | "agent",
    description: string,
    isLocked: boolean          // true = only system can modify types in this namespace
  }
}
```

**Lifecycle State**
```ts
// minion-status
// answers: "what stage of its life is this type or instance in?"
{
  type: "minion-status",
  fields: {
    name: string,              // "in-progress", "blocked", "done"
    label: string,             // human readable display label
    color: string,
    isTerminal: boolean,       // true = no further transitions expected
    allowedTransitions: string[], // which statuses can follow this one
    order: number,             // position in a typical flow
    namespaceId: string        // statuses can be scoped per domain
  }
}
```

**Importance and Urgency**
```ts
// minion-priority
// answers: "how important or urgent is this relative to others?"
{
  type: "minion-priority",
  fields: {
    name: string,              // "critical", "high", "medium", "low"
    label: string,
    weight: number,            // numeric for sorting: 100, 75, 50, 25
    color: string,
    icon: string,
    isDefault: boolean         // which priority is assumed when none is set
  }
}
```

---

## Relations

```
minion-group        --contains-->           MinionType (by name ref)
minion-group        --belongs_to-->         minion-category
minion-group        --scoped_to-->          minion-namespace
minion-category     --parent_of-->          minion-category
minion-tag          --scoped_to-->          minion-namespace
minion-tag-assignment --tags-->             any Minion (via targetType + targetId)
minion-status       --transitions_to-->     minion-status
minion-status       --scoped_to-->          minion-namespace
minion-priority     --scoped_to-->          minion-namespace
```

---

## How It Connects to Other Toolboxes

`minions-taxonomy` is unique in that **every other toolbox depends on it, but it depends on nothing**. It sits at the base of the entire ecosystem.

```
minions-tasks       uses minion-priority for task.priority
                    uses minion-status for task.status
                    uses minion-tag-assignment to label any task
                    uses minion-group to say "these task types belong to Freelance Hunter"

minions-jobs        uses minion-tag-assignment to tag job-postings ("red-flag", "shortlisted")
                    uses minion-namespace to mark types as owned by "toolbox:minions-jobs"
                    uses minion-category to place job-posting under "Jobs > Freelance > Posting"

minions-agents      uses minion-status for agent-definition.status
                    uses minion-group to bundle all agent-related types together
                    uses minion-namespace "system" to lock core agent types

minions-pipeline    uses minion-status as the definition of each pipeline stage state
                    uses minion-priority to rank pipeline entries

minions-approvals   uses minion-status for approval-request.decision state
                    uses minion-tag-assignment to flag audit-log-entries

every toolbox       uses minion-namespace to declare ownership of its types
                    uses minion-group to expose its purpose bundle in the UI
```

The practical result: when you browse 500 MinionTypes in the UI, you can filter by any combination —

```
category: "Jobs"  AND  tag: "ai-generated"  AND  namespace: "toolbox:minions-jobs"
→ returns: job-posting, job-signal, job-watchlist
```

---

## Agent SKILLS for `minions-taxonomy`

```markdown
# TaxonomyAgent Skills

## Context
You manage all organizational metadata in the Minions ecosystem.
You own minions-taxonomy. You read from all other toolboxes to classify
and label their Minion instances, but you never write to their stores directly.
Your job is to keep the ecosystem navigable as it grows.

## Skill: Bootstrap Taxonomy
- On first run, create the root minion-category tree:
  Jobs > Freelance, Jobs > Contract
  Agents > Orchestrator, Agents > Worker, Agents > Watcher
  Finance > Costs, Finance > Contracts
  Profile > Skills, Profile > Portfolio
  Operations > Approvals, Operations > Audit, Operations > Scheduling
- Create system minion-namespace entries: "system", "user"
- Create one minion-namespace per installed toolbox: "toolbox:minions-jobs" etc.
- Create default minion-priority set: critical (100), high (75), medium (50), low (25)
- Mark one priority isDefault: true (medium)
- Create default minion-status sets per domain (jobs, tasks, approvals, agents)

## Skill: Register New Toolbox
- When a new toolbox is installed:
  1. Create a minion-namespace for it
  2. Create or find a minion-group matching its purpose
  3. Add all its MinionType names to that group's minionTypes list
  4. Place the group under the correct minion-category node
  5. Apply system tags to each type: "toolbox-managed", and any trait tags

## Skill: Tag Minion Instances
- When instructed by Orchestrator or another agent:
  1. Create a minion-tag-assignment linking a tag to a target Minion
  2. Verify the tag exists — if not, create it in the appropriate namespace
  3. Log the assignment with assignedBy set to the requesting agent

## Skill: Maintain Category Tree
- When a new minion-group has no matching category:
  1. Propose a category path to the Orchestrator for approval
  2. On approval, create the minion-category chain (parent first, then child)
  3. Link the group to the leaf category

## Skill: Audit Taxonomy Health
- On schedule (weekly):
  1. Find MinionTypes not assigned to any minion-group → report as "unclassified"
  2. Find minion-tags with zero assignments → report as "unused tags"
  3. Find minion-categories with no groups → report as "empty categories"
  4. Send summary to Orchestrator for review

## Skill: Answer Navigation Queries
- When an agent asks "what types belong to group X":
  → return minionTypes[] from the matching minion-group
- When an agent asks "find all types tagged Y in namespace Z":
  → query minion-tag-assignments filtered by tag name and namespace
- When an agent asks "what is the default priority":
  → return the minion-priority where isDefault == true

## Hard Rules
- Never delete a minion-namespace marked isLocked
- Never remove a MinionType from a group without Orchestrator approval
- Always set namespaceId when creating tags, statuses, or priorities
- System-created minion-status entries (isSystem: true) cannot be renamed
```

---

## Why `minion-tag-assignment` is a Separate Type

Worth calling out explicitly: the tag-to-Minion link is its own MinionType rather than a field on each Minion. This means:

```
any Minion can be tagged without modifying its own schema
tags can be added, removed, and queried uniformly across all types
the full tagging history is queryable (who tagged what, when, and why)
agents can tag job-postings, tasks, proposals, and runs all through one interface
```

This is the same pattern as `task-assignment` in `minions-tasks` — the relation itself is a first-class Minion, which keeps every individual type clean and makes cross-domain queries possible.
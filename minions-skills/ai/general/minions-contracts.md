---
name: minions-contracts
id: OC-0119
version: 1.0.0
description: "Agreements, statements of work, terms, and signed documents"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-contracts — Agent Skills

## What is a Contract in the Minions Context?

Before defining types, it's worth being precise. A "contract" can mean very different things:

```
a formal agreement between two parties      → Contract
a specific clause or obligation             → ContractTerm
a scoped deliverable committed to           → Deliverable
a milestone tied to payment                 → PaymentMilestone
a change to the original scope              → ChangeRequest
a signed or versioned document              → linked to minions-documents
the current health/status of the engagement → ContractStatus / Review
```

---

## MinionTypes

**Core**
```ts
// contract
{
  type: "contract",
  fields: {
    title: string,
    clientId: string,              // ref to person in minions-contacts
    organizationId: string,        // ref to org in minions-contacts
    applicationId: string,         // ref to minions-applications
    type: "fixed-price" | "hourly" | "retainer" | "milestone-based",
    status: "draft" | "sent" | "negotiating" | "active" | "paused" | "completed" | "cancelled" | "disputed",
    platform: string,              // upwork, freelancer, direct, etc.
    value: number,
    currency: string,
    startDate: datetime,
    endDate: datetime,
    signedAt: datetime,
    documentId: string,            // ref to minions-documents for the actual text
    createdAt: datetime,
    updatedAt: datetime
  }
}

// contract-term
{
  type: "contract-term",
  fields: {
    contractId: string,
    label: string,                 // "Payment terms", "IP ownership", "NDA"
    body: string,
    category: "payment" | "ip" | "confidentiality" | "scope" | "termination" | "liability" | "other",
    isNegotiable: boolean,
    agreedAt: datetime,
    notes: string
  }
}

// deliverable
{
  type: "deliverable",
  fields: {
    contractId: string,
    title: string,
    description: string,
    dueAt: datetime,
    status: "pending" | "in-progress" | "submitted" | "revision-requested" | "accepted" | "rejected",
    submittedAt: datetime,
    acceptedAt: datetime,
    attachmentIds: string[],       // refs to minions-documents attachments
    taskIds: string[],             // refs to minions-tasks
    notes: string
  }
}
```

**Payment**
```ts
// payment-milestone
{
  type: "payment-milestone",
  fields: {
    contractId: string,
    deliverableId: string,         // optional — milestone may not tie to a deliverable
    title: string,
    amount: number,
    currency: string,
    dueAt: datetime,
    status: "pending" | "invoiced" | "paid" | "overdue" | "disputed",
    paidAt: datetime,
    invoiceId: string,             // ref to minions-costs invoice
    notes: string
  }
}

// invoice
{
  type: "invoice",
  fields: {
    contractId: string,
    clientId: string,
    issueDate: datetime,
    dueDate: datetime,
    lineItems: string,             // serialized array of { description, amount }
    totalAmount: number,
    currency: string,
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled",
    paidAt: datetime,
    documentId: string
  }
}
```

**Negotiation & Changes**
```ts
// change-request
{
  type: "change-request",
  fields: {
    contractId: string,
    requestedBy: "client" | "me",
    title: string,
    description: string,
    scopeImpact: string,
    budgetImpact: number,
    timelineImpact: string,
    status: "proposed" | "under-review" | "accepted" | "rejected" | "withdrawn",
    proposedAt: datetime,
    resolvedAt: datetime,
    approvalRequestId: string      // ref to minions-approvals if needs my sign-off
  }
}

// negotiation-note
{
  type: "negotiation-note",
  fields: {
    contractId: string,
    body: string,
    authorId: string,
    authorType: "human" | "agent",
    stage: string,                 // "initial offer", "counter", "final terms"
    createdAt: datetime
  }
}
```

**Review & Health**
```ts
// contract-review
{
  type: "contract-review",
  fields: {
    contractId: string,
    reviewedAt: datetime,
    reviewedBy: string,
    overallHealth: "green" | "amber" | "red",
    deliverablesOnTrack: boolean,
    paymentsOnTrack: boolean,
    clientSatisfaction: "positive" | "neutral" | "negative" | "unknown",
    risks: string,
    recommendations: string
  }
}

// contract-event
{
  type: "contract-event",
  fields: {
    contractId: string,
    eventType: "signed" | "started" | "deliverable-submitted" | "payment-received" | "dispute-raised" | "renewed" | "terminated",
    occurredAt: datetime,
    triggeredBy: string,
    notes: string
  }
}
```

---

## Relations

```
contract           --has_term-->              contract-term
contract           --has_deliverable-->        deliverable
contract           --has_milestone-->          payment-milestone
contract           --has_invoice-->            invoice
contract           --has_change_request-->     change-request
contract           --has_review-->             contract-review
contract           --logged_in-->              contract-event
contract           --originated_from-->        application (minions-applications)
contract           --with_client-->            client-profile (minions-clients)
contract           --documented_in-->          document (minions-documents)
deliverable        --broken_into-->            task (minions-tasks)
change-request     --requires_approval-->      approval-request (minions-approvals)
payment-milestone  --tracked_in-->             cost-entry (minions-costs)
```

---

## How It Connects to Other Toolboxes

```
minions-applications   →  contract originates from a won application
minions-clients        →  contract is with a client-profile
minions-contacts       →  client is a person + organization
minions-documents      →  contract body, SOW, and invoices are stored as documents
minions-tasks          →  deliverables are broken into tasks assigned to agents or me
minions-approvals      →  change requests and contract sign-off route through approvals
minions-costs          →  payment milestones feed into the cost/revenue ledger
minions-comms          →  negotiation happens in threads, contract events trigger notifications
minions-pipeline       →  winning a contract advances the pipeline entry to "won"
```

---

## Agent SKILLS for `minions-contracts`

```markdown
# ContractAgent Skills

## Context
You manage all contract data within the Minions ecosystem. You read from
minions-applications to know when a job has been won, minions-clients for
client context, and minions-documents to store the actual contract text.
You write only to minions-contracts. You never sign or accept anything
without a logged approval-request with status "approved".

## Skill: Create Contract from Won Application
1. On receiving signal that an application status changed to "won":
   - Load the application and linked job-posting Minions
   - Create a `contract` Minion with status "draft"
   - Pre-fill client, platform, value from job-posting budget
   - Link applicationId and clientId
2. Create a `document` Minion in minions-documents for the contract body
3. Notify Orchestrator: { type: "contract-draft-ready", contractId }

## Skill: Parse and Structure Contract Terms
1. When a contract document is provided or received from client:
   - Extract each clause and create a `contract-term` Minion per clause
   - Categorize each term: payment, ip, confidentiality, scope, termination
   - Flag any terms marked isNegotiable: false that differ from standard preferences
2. Create `negotiation-note` Minions for any flagged terms
3. Route flagged terms through minions-approvals before accepting

## Skill: Track Deliverables
1. For each deliverable in the contract:
   - Create a `deliverable` Minion with dueAt and description
   - Break it into `task` Minions in minions-tasks
   - Assign tasks with contextRefType: "deliverable", contextRefId
2. Monitor task completion — when all tasks for a deliverable are done:
   - Update deliverable status to "submitted"
   - Create a `contract-event` Minion with eventType: "deliverable-submitted"
   - Notify client via minions-comms

## Skill: Manage Payment Milestones
1. For each payment milestone:
   - Create a `payment-milestone` Minion with amount and dueAt
   - Monitor dueAt — if payment not received within 3 days of due date:
     - Update status to "overdue"
     - Create a follow-up in minions-comms
     - Alert me via minions-approvals with full context
2. On payment received:
   - Update status to "paid", set paidAt
   - Create a `cost-entry` Minion in minions-costs for revenue tracking
   - Log `contract-event` with eventType: "payment-received"

## Skill: Handle Change Requests
1. On receiving a change request from client (via minions-comms thread):
   - Create a `change-request` Minion with full scope, budget, and timeline impact
   - Create an `approval-request` Minion in minions-approvals
   - Never accept or reject without my explicit decision
2. On approval decision:
   - If accepted: update contract value and timeline, log contract-event
   - If rejected: update change-request status, draft response via minions-comms

## Skill: Periodic Contract Health Review
1. On schedule (weekly for active contracts):
   - Load all active `contract` Minions
   - For each: check deliverable statuses, milestone statuses, recent comms sentiment
   - Create a `contract-review` Minion with overallHealth rating
   - If health is "red": immediately notify me with risks and recommendations
   - If health is "amber": include in daily briefing

## Skill: Contract Closure
1. When all deliverables are accepted and all milestones paid:
   - Update contract status to "completed"
   - Log contract-event with eventType: "terminated" or natural close
   - Update client-profile in minions-clients with outcome data
   - Create a memory-item in minions-memory with lessons learned
   - Trigger pipeline transition in minions-pipeline to "won-complete"

## Hard Rules
- Never accept contract terms or change requests without approval-request status "approved"
- Never create an invoice without a linked payment-milestone
- Every status change on contract or deliverable must produce a contract-event
- All factual claims about deliverables must trace to task outcomes in minions-tasks
- Max one follow-up per overdue milestone per 48 hours
```

---

The `contract-review` with the health rating is worth highlighting — it gives the ContractAgent a structured way to surface problems early rather than waiting for a missed deadline or payment dispute to escalate. Combined with the `change-request` routing through `minions-approvals`, nothing irreversible happens without your explicit sign-off.

---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-contracts/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).
Storage uses sharded directories: `.minions/<id[0..1]>/<id[2..3]>/<id>.json`

### Discover Types

```bash
# List all MinionTypes with their fields
contracts types list

# Show detailed schema for a specific type
contracts types show <type-slug>
```

### Create

```bash
# Create with shortcut flags
contracts create <type> -t "Title" -s "status" -p "priority"

# Create with full field data
contracts create <type> --data '{ ... }'
```

### Read

```bash
# List all Minions of a type
contracts list <type>

# Show a specific Minion
contracts show <id>

# Search by text
contracts search "query"

# Output as JSON (for piping)
contracts list --json
contracts show <id> --json
```

### Update

```bash
# Update fields
contracts update <id> --data '{ "status": "active" }'
```

### Delete

```bash
# Soft-delete (marks as deleted, preserves data)
contracts delete <id>
```

### Stats & Validation

```bash
# Show storage stats
contracts stats

# Validate a Minion JSON file against its schema
contracts validate ./my-minion.json
```
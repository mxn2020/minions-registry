---
name: minions-orders
id: OC-0134
version: 1.0.0
description: "Order records, service selections, onboarding checklists, and invoices"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-orders — Agent Skills

## What is a Order in the Minions Context?

```
an order placed by a client               → Order
onboarding steps for a new client         → OnboardingChecklist
an invoice for an order                   → OrderInvoice
```

## MinionTypes
```ts
// order — lead, deal, services, total amount, status
// onboarding-checklist — steps, current step, status
// order-invoice — invoice number, amount, issued/due/paid dates, status
```

## Agent SKILLS
```markdown
# OrderAgent Skills
## Skill: Process Order — create order, initiate onboarding
## Skill: Generate Invoice — create invoice from order
## Hard Rules — every order must have an onboarding checklist
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-orders/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
orders types list
orders types show <type-slug>
```

### CRUD

```bash
orders create <type> -t "Title" -s "status"
orders list <type>
orders show <id>
orders update <id> --data '{ "status": "active" }'
orders delete <id>
orders search "query"
```

### Stats & Validation

```bash
orders stats
orders validate ./my-minion.json
```
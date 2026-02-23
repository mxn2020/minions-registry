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

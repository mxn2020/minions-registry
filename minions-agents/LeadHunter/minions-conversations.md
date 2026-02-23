## What is a Conversation in the Minions Context?

```
an email thread with a lead               → EmailThread
a single email in a thread                → EmailMessage
a rule that escalates to human            → EscalationTrigger
```

## MinionTypes
```ts
// email-thread — lead, subject, status, message count, detected intent/sentiment
// email-message — direction (inbound/outbound), body, parsed intent, sentiment
// escalation-trigger — condition (call-requested/order/negative-sentiment), action
```

## Agent SKILLS
```markdown
# ConversationAgent Skills
## Skill: Parse Reply — detect intent and sentiment from inbound emails
## Skill: Handle Escalation — route to human when triggers fire
## Hard Rules — every inbound email must be parsed for intent
```

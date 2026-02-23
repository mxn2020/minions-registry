## What is a Outreach in the Minions Context?

```
a reusable email template                 → EmailTemplate
a multi-step email sequence               → DripSequence
a record of a sent email                  → OutreachSend
```

## MinionTypes
```ts
// email-template — subject, body, intent, personalization fields
// drip-sequence — steps with delays, target segment
// outreach-send — lead, template, step index, sent/opened/clicked timestamps
```

## Agent SKILLS
```markdown
# OutreachAgent Skills
## Skill: Create Drip Sequence — define multi-step personalized emails
## Skill: Execute Send — personalize and send per schedule
## Hard Rules — respect cooldowns, never send duplicate emails
```

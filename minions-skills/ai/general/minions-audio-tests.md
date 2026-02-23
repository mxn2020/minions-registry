---
name: minions-audio-tests
id: OC-0107
version: 1.0.0
description: "Voice interaction configs, TTS/STT pipeline settings, and audio samples"
category: ai
subcategory: general
tags: ["minion", "ai", "general"]
comments:
---

# minions-audio-tests — Agent Skills

## What is a Audio Test in the Minions Context?

```
a voice interaction test config           → AudioTestConfig
an audio sample for testing               → AudioSample
```

## MinionTypes
```ts
// audio-test-config — target, mode (voice-sync/voice-async), TTS/STT providers
// audio-sample — transcript, audio URL, STT result, accuracy score
```

## Agent SKILLS
```markdown
# AudioRunnerAgent Skills
## Skill: Run Voice Test — send audio, capture response, measure latency
## Hard Rules — always measure STT accuracy alongside response quality
```


---

## CLI Reference

Install globally:

```bash
pnpm add -g @minions-audio-tests/cli
```

Set `MINIONS_STORE` env var to control where data is stored (default: `.minions/`).

### Discover Types

```bash
audio-tests types list
audio-tests types show <type-slug>
```

### CRUD

```bash
audio-tests create <type> -t "Title" -s "status"
audio-tests list <type>
audio-tests show <id>
audio-tests update <id> --data '{ "status": "active" }'
audio-tests delete <id>
audio-tests search "query"
```

### Stats & Validation

```bash
audio-tests stats
audio-tests validate ./my-minion.json
```
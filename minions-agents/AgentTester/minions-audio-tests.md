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

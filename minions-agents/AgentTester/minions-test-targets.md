## What is a Test Target in the Minions Context?

```
an AI agent registered for testing        → TestTarget
a declared capability of that agent       → TargetCapability
```

## MinionTypes
```ts
// test-target — name, endpoint, protocol (http/ws/grpc), framework, auth
// target-capability — tool names, expected behavior descriptions
```

## Relations
```
test-target       --has_capability-->    target-capability
test-target       --tested_by-->         test-scenario (minions-test-scenarios)
test-target       --traced_by-->         test-trace (minions-test-observability)
```

## Agent SKILLS
```markdown
# TargetAgent Skills
## Skill: Register Target — define endpoint, capabilities, auth
## Hard Rules — every target must declare its capabilities before testing
```

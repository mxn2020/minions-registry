## What is a Test Scenario in the Minions Context?

```
a multi-turn conversation test            → TestScenario
a simulated user persona                  → TesterPersona
expected input-output pairs               → GoldenDataset
```

AI-as-Tester: the ScenarioAgent dynamically converses with the agent-under-test.

## MinionTypes
```ts
// test-scenario — name, turns, expected outcome, difficulty, tags
// tester-persona — traits, communication style, technical level
// golden-dataset — curated expected pairs for regression testing
```

## Agent SKILLS
```markdown
# ScenarioAgent Skills
## Skill: Design Scenario — create multi-turn test with assertions
## Skill: Run AI-as-Tester — dynamically converse using persona
## Hard Rules — every scenario must have expected outcomes defined
```

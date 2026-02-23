## What is a Component Eval in the Minions Context?

```
a benchmark for a pipeline component      → ComponentBenchmark
a result from running a benchmark         → BenchmarkResult
```

Evaluates isolated components: RAG correctness, routing accuracy, classification F1.

## MinionTypes
```ts
// component-benchmark — component type, target, dataset, threshold
// benchmark-result — score, metric breakdown, pass/fail, prompt version
```

## Agent SKILLS
```markdown
# EvalAgent Skills
## Skill: Run Benchmark — execute against isolated component
## Hard Rules — benchmarks must use versioned datasets for reproducibility
```

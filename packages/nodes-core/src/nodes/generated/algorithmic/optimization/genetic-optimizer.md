# GeneticOptimizer Node

**Category:** Algorithmic / Optimization

Genetic algorithm optimization

## Parameters

### Population Size

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

### Generations

- **Type:** number
- **Default:** 50
- **Min:** 5
- **Max:** 500

### Mutation Rate

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 0.5

### Crossover Rate

- **Type:** number
- **Default:** 0.8
- **Min:** 0.1
- **Max:** 1

### Elitism

- **Type:** number
- **Default:** 0.1
- **Min:** 0
- **Max:** 0.5

## Inputs

### Objectives

- **Type:** Properties
- **Required:** Yes

### Constraints

- **Type:** Properties
- **Required:** No

### Bounds

- **Type:** Properties
- **Required:** Yes

## Outputs

### Best Solution

- **Type:** Properties

### Fitness

- **Type:** number

### Generations

- **Type:** Properties[]

### Convergence

- **Type:** number[]

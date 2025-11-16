# ParticleSwarmOptimizer Node

**Category:** Algorithmic / Optimization

Particle swarm optimization

## Parameters

### Swarm Size

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 500

### Iterations

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

### Inertia

- **Type:** number
- **Default:** 0.7
- **Min:** 0.1
- **Max:** 1

### Cognitive

- **Type:** number
- **Default:** 2
- **Min:** 0.1
- **Max:** 4

### Social

- **Type:** number
- **Default:** 2
- **Min:** 0.1
- **Max:** 4

## Inputs

### Objective

- **Type:** Properties
- **Required:** Yes

### Bounds

- **Type:** Properties
- **Required:** Yes

## Outputs

### Global Best

- **Type:** Properties

### Best Value

- **Type:** number

### Swarm History

- **Type:** Properties[]

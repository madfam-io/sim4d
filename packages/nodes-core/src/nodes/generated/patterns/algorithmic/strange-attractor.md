# StrangeAttractor Node

**Category:** Patterns / Algorithmic

Strange attractor patterns

## Parameters

### Type

- **Type:** enum
- **Default:** "lorenz"

### Iterations

- **Type:** number
- **Default:** 10000
- **Min:** 100
- **Max:** 100000

### Dt

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 0.1

## Inputs

### Initial

- **Type:** Point
- **Required:** Yes

## Outputs

### Attractor

- **Type:** Point[]

### Trajectory

- **Type:** Wire

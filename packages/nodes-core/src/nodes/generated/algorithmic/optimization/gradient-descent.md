# GradientDescent Node

**Category:** Algorithmic / Optimization

Gradient descent optimization

## Parameters

### Learning Rate

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Max Iterations

- **Type:** number
- **Default:** 1000
- **Min:** 10
- **Max:** 10000

### Tolerance

- **Type:** number
- **Default:** 0.001
- **Min:** 0.000001
- **Max:** 0.1

### Momentum

- **Type:** number
- **Default:** 0.9
- **Min:** 0
- **Max:** 1

## Inputs

### Objective

- **Type:** Properties
- **Required:** Yes

### Initial Point

- **Type:** Point
- **Required:** Yes

## Outputs

### Optimum Point

- **Type:** Point

### Optimum Value

- **Type:** number

### Trajectory

- **Type:** Point[]

### Convergence

- **Type:** number[]

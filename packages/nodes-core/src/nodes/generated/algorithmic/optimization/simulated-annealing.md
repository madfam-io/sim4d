# SimulatedAnnealing Node

**Category:** Algorithmic / Optimization

Simulated annealing optimization

## Parameters

### Initial Temp

- **Type:** number
- **Default:** 1000
- **Min:** 1
- **Max:** 10000

### Final Temp

- **Type:** number
- **Default:** 0.1
- **Min:** 0.001
- **Max:** 10

### Cooling Rate

- **Type:** number
- **Default:** 0.95
- **Min:** 0.8
- **Max:** 0.99

### Max Iterations

- **Type:** number
- **Default:** 1000
- **Min:** 100
- **Max:** 10000

## Inputs

### Objective

- **Type:** Properties
- **Required:** Yes

### Initial Solution

- **Type:** Properties
- **Required:** Yes

## Outputs

### Best Solution

- **Type:** Properties

### Best Value

- **Type:** number

### Temperature

- **Type:** number[]

### Values

- **Type:** number[]

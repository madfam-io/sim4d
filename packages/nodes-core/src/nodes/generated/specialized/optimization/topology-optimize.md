# TopologyOptimize Node

**Category:** Specialized / Optimization

Topology optimization

## Parameters

### Volume Fraction

- **Type:** number
- **Default:** 0.3
- **Min:** 0.1
- **Max:** 0.9

### Penalty Factor

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 5

### Filter Radius

- **Type:** number
- **Default:** 2
- **Min:** 0.5
- **Max:** 10

### Iterations

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 500

## Inputs

### Design Space

- **Type:** Shape
- **Required:** Yes

### Loads

- **Type:** Data
- **Required:** Yes

### Constraints

- **Type:** Data
- **Required:** Yes

## Outputs

### Optimized

- **Type:** Shape

### Convergence

- **Type:** Data

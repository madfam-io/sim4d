# TopologyOptimizer Node

**Category:** Algorithmic / Optimization

Topology optimization for structures

## Parameters

### Density Elements

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

### Volume Fraction

- **Type:** number
- **Default:** 0.5
- **Min:** 0.1
- **Max:** 0.9

### Penalization

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 5

### Filter

- **Type:** boolean
- **Default:** true

## Inputs

### Design Domain

- **Type:** Shape
- **Required:** Yes

### Loads

- **Type:** Properties[]
- **Required:** Yes

### Supports

- **Type:** Properties[]
- **Required:** Yes

## Outputs

### Optimized Shape

- **Type:** Shape

### Density Field

- **Type:** Properties

### Compliance

- **Type:** number

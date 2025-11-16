# FieldOptimize Node

**Category:** Fields / Advanced

Optimize field for objective

## Parameters

### Iterations

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000
- **Description:** Optimization iterations

### Objective

- **Type:** enum
- **Default:** "\"minimize\""

- **Description:** Optimization objective

### Learning Rate

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1
- **Description:** Learning rate

## Inputs

### Initial Field

- **Type:** Field
- **Required:** No

### Constraints

- **Type:** Field
- **Required:** No

## Outputs

### Optimized Field

- **Type:** Field

### Convergence

- **Type:** NumberList

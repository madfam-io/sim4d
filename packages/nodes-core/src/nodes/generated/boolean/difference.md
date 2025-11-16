# Difference Node

**Category:** Boolean

Subtract tool shapes from base shape

## Parameters

### Keep Originals

- **Type:** boolean
- **Default:** false

### Fuzzy Value

- **Type:** number
- **Default:** 1e-7
- **Min:** 0
- **Max:** 1

## Inputs

### Base

- **Type:** Shape
- **Required:** Yes
- **Description:** Base shape

### Tools

- **Type:** Shape[]
- **Required:** Yes
- **Description:** Shapes to subtract

## Outputs

### Result

- **Type:** Shape
- **Description:** Difference result

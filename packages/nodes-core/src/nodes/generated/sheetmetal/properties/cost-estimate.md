# CostEstimate Node

**Category:** SheetMetal / Properties

Estimate manufacturing cost

## Parameters

### Material Cost Per Kg

- **Type:** number
- **Default:** 2
- **Min:** 0.1
- **Max:** 1000

### Setup Cost

- **Type:** number
- **Default:** 50
- **Min:** 0
- **Max:** 10000

### Bend Cost

- **Type:** number
- **Default:** 0.5
- **Min:** 0
- **Max:** 100
- **Description:** Cost per bend

### Cut Cost Per Meter

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 100

## Inputs

### Sheet

- **Type:** Shape
- **Required:** Yes

### Quantity

- **Type:** number
- **Required:** No

## Outputs

### Cost

- **Type:** number

### Breakdown

- **Type:** Data

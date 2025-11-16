# DrillingOperation Node

**Category:** Fabrication / CNC

Drilling operation setup

## Parameters

### Drill Diameter

- **Type:** number
- **Default:** 8
- **Min:** 0.1
- **Max:** 50

### Peck Depth

- **Type:** number
- **Default:** 5
- **Min:** 0
- **Max:** 20

### Dwell Time

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 10

## Inputs

### Holes

- **Type:** Point[]
- **Required:** Yes

### Depths

- **Type:** number[]
- **Required:** Yes

## Outputs

### Drill Cycles

- **Type:** Data

# ToolpathGeneration Node

**Category:** Fabrication / CNC

Generate CNC toolpaths

## Parameters

### Strategy

- **Type:** enum
- **Default:** "parallel"

### Tool Diameter

- **Type:** number
- **Default:** 6
- **Min:** 0.1
- **Max:** 50

### Stepover

- **Type:** number
- **Default:** 0.5
- **Min:** 0.1
- **Max:** 1

## Inputs

### Model

- **Type:** Shape
- **Required:** Yes

### Stock

- **Type:** Shape
- **Required:** No

## Outputs

### Toolpath

- **Type:** Wire[]

### Rapids

- **Type:** Wire[]

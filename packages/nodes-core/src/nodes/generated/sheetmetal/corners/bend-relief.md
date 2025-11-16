# BendRelief Node

**Category:** SheetMetal / Corners

Add bend relief cuts

## Parameters

### Relief Type

- **Type:** enum
- **Default:** "rectangular"

### Relief Depth

- **Type:** number
- **Default:** 5
- **Min:** 0.1
- **Max:** 100

### Relief Width

- **Type:** number
- **Default:** 2
- **Min:** 0.1
- **Max:** 50

## Inputs

### Sheet

- **Type:** Shape
- **Required:** Yes

### Bends

- **Type:** Edge[]
- **Required:** Yes

## Outputs

### Result

- **Type:** Shape

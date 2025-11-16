# CornerRelief Node

**Category:** SheetMetal / Corners

Add corner relief cuts

## Parameters

### Relief Type

- **Type:** enum
- **Default:** "circular"

### Relief Size

- **Type:** number
- **Default:** 5
- **Min:** 0.1
- **Max:** 100

### Relief Ratio

- **Type:** number
- **Default:** 0.5
- **Min:** 0.1
- **Max:** 1

## Inputs

### Sheet

- **Type:** Shape
- **Required:** Yes

### Corners

- **Type:** Vertex[]
- **Required:** Yes

## Outputs

### Result

- **Type:** Shape

# SketchedBend Node

**Category:** SheetMetal / Bends

Create bend from sketch line

## Parameters

### Angle

- **Type:** number
- **Default:** 90
- **Min:** -180
- **Max:** 180

### Bend Radius

- **Type:** number
- **Default:** 3
- **Min:** 0.1
- **Max:** 100

### Bend Direction

- **Type:** enum
- **Default:** "up"

### Bend Allowance

- **Type:** number
- **Default:** 0
- **Min:** -10
- **Max:** 10

## Inputs

### Sheet

- **Type:** Shape
- **Required:** Yes

### Bend Line

- **Type:** Edge
- **Required:** Yes

## Outputs

### Result

- **Type:** Shape

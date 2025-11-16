# EdgeFlange Node

**Category:** SheetMetal / Flanges

Create flange from edge

## Parameters

### Height

- **Type:** number
- **Default:** 25
- **Min:** 0.1
- **Max:** 1000
- **Description:** Flange height

### Angle

- **Type:** number
- **Default:** 90
- **Min:** 0
- **Max:** 180
- **Description:** Bend angle in degrees

### Bend Radius

- **Type:** number
- **Default:** 3
- **Min:** 0.1
- **Max:** 100
- **Description:** Bend radius

### Bend Relief

- **Type:** enum
- **Default:** "rectangular"

### Relief Ratio

- **Type:** number
- **Default:** 0.5
- **Min:** 0.1
- **Max:** 1

## Inputs

### Sheet

- **Type:** Shape
- **Required:** Yes

### Edge

- **Type:** Edge
- **Required:** Yes

## Outputs

### Result

- **Type:** Shape

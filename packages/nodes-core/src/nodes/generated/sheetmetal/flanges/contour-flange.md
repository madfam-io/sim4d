# ContourFlange Node

**Category:** SheetMetal / Flanges

Create flange from sketch contour

## Parameters

### Angle

- **Type:** number
- **Default:** 90
- **Min:** 0
- **Max:** 180

### Bend Radius

- **Type:** number
- **Default:** 3
- **Min:** 0.1
- **Max:** 100

### Flange Position

- **Type:** enum
- **Default:** "material-inside"

## Inputs

### Sheet

- **Type:** Shape
- **Required:** Yes

### Contour

- **Type:** Wire
- **Required:** Yes

### Profile

- **Type:** Wire
- **Required:** No
- **Description:** Custom profile for flange

## Outputs

### Result

- **Type:** Shape

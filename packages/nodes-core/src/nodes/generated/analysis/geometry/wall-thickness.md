# WallThickness Node

**Category:** Analysis / Geometry

Analyze wall thickness

## Parameters

### minThickness

- **Type:** number
- **Default:** 1
- **Min:** 0.01
- **Max:** 1000

### maxThickness

- **Type:** number
- **Default:** 10
- **Min:** 0.01
- **Max:** 1000

## Inputs

### solid

- **Type:** Solid
- **Required:** Yes

## Outputs

### thinAreas

- **Type:** Face[]
- **Description:** Areas below minimum

### thickAreas

- **Type:** Face[]
- **Description:** Areas above maximum

### averageThickness

- **Type:** number
- **Description:** Average wall thickness

# FiveAxisPositioning Node

**Category:** Fabrication / CNC

5-axis positioning strategy

## Parameters

### Lead Angle

- **Type:** number
- **Default:** 10
- **Min:** 0
- **Max:** 45

### Tilt Angle

- **Type:** number
- **Default:** 0
- **Min:** -90
- **Max:** 90

## Inputs

### Surface

- **Type:** Face
- **Required:** Yes

### Tool Axis

- **Type:** Vector
- **Required:** No

## Outputs

### Tool Orientations

- **Type:** Transform[]

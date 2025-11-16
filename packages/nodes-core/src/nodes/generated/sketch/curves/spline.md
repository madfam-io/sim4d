# Spline Node

**Category:** Sketch / Curves

Create a spline curve through points

## Parameters

### Degree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10
- **Description:** Spline degree

### Closed

- **Type:** boolean
- **Default:** false

- **Description:** Close the spline

### Smooth

- **Type:** boolean
- **Default:** true

- **Description:** Smooth tangents

## Inputs

### Points

- **Type:** Point[]
- **Required:** Yes
- **Description:** Control points

### Tangents

- **Type:** Vector[]
- **Required:** No
- **Description:** Optional tangent vectors

## Outputs

### Curve

- **Type:** Wire
- **Description:** Spline curve

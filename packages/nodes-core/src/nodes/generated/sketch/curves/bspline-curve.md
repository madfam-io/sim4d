# BSplineCurve Node

**Category:** Sketch / Curves

Create a B-Spline curve

## Parameters

### Degree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### Periodic

- **Type:** boolean
- **Default:** false

## Inputs

### Control Points

- **Type:** Point[]
- **Required:** Yes

### Knots

- **Type:** number[]
- **Required:** No
- **Description:** Knot vector

### Weights

- **Type:** number[]
- **Required:** No
- **Description:** Control point weights

## Outputs

### Curve

- **Type:** Wire
- **Description:** B-Spline curve

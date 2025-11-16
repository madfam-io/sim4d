# BSplineCurve Node

**Category:** Sketch / Curves

Create a B-Spline curve

## Parameters

### degree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### periodic

- **Type:** boolean
- **Default:** false

## Inputs

### controlPoints

- **Type:** Point[]
- **Required:** Yes

### knots

- **Type:** number[]
- **Required:** No
- **Description:** Knot vector

### weights

- **Type:** number[]
- **Required:** No
- **Description:** Control point weights

## Outputs

### curve

- **Type:** Wire
- **Description:** B-Spline curve

# BSplineSurface Node

**Category:** Solid / Surface

Create a B-Spline surface

## Parameters

### U Degree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### V Degree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### U Periodic

- **Type:** boolean
- **Default:** false

### V Periodic

- **Type:** boolean
- **Default:** false

## Inputs

### Control Points

- **Type:** Point[][]
- **Required:** Yes

### U Knots

- **Type:** number[]
- **Required:** No

### V Knots

- **Type:** number[]
- **Required:** No

## Outputs

### Surface

- **Type:** Face
- **Description:** B-Spline surface

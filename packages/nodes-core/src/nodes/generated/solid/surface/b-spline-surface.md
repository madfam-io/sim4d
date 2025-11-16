# BSplineSurface Node

**Category:** Solid / Surface

Create a B-Spline surface

## Parameters

### uDegree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### vDegree

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### uPeriodic

- **Type:** boolean
- **Default:** false

### vPeriodic

- **Type:** boolean
- **Default:** false

## Inputs

### controlPoints

- **Type:** Point[][]
- **Required:** Yes

### uKnots

- **Type:** number[]
- **Required:** No

### vKnots

- **Type:** number[]
- **Required:** No

## Outputs

### surface

- **Type:** Face
- **Description:** B-Spline surface

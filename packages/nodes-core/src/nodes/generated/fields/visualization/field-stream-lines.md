# FieldStreamLines Node

**Category:** Fields / Visualization

Generate streamlines through vector field

## Parameters

### Seed Count

- **Type:** number
- **Default:** 20
- **Min:** 1
- **Max:** 1000
- **Description:** Number of streamlines

### Step Size

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1
- **Description:** Integration step size

### Max Steps

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000
- **Description:** Maximum steps per line

## Inputs

### Field

- **Type:** VectorField
- **Required:** No

### Seed Points

- **Type:** PointSet
- **Required:** No

## Outputs

### Streamlines

- **Type:** CurveSet

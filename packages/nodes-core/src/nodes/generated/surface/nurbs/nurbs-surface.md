# NurbsSurface Node

**Category:** Surface / NURBS

Create NURBS surface from control points

## Parameters

### Degree U

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### Degree V

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### Periodic U

- **Type:** boolean
- **Default:** false

### Periodic V

- **Type:** boolean
- **Default:** false

## Inputs

### Control Points

- **Type:** Point[][]
- **Required:** Yes

### Weights

- **Type:** number[][]
- **Required:** No

### Knots U

- **Type:** number[]
- **Required:** No

### Knots V

- **Type:** number[]
- **Required:** No

## Outputs

### Surface

- **Type:** Face

# NetworkSurface Node

**Category:** Surface / NURBS

Create surface from curve network

## Parameters

### Continuity

- **Type:** enum
- **Default:** "G1"

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.0001
- **Max:** 1

## Inputs

### U Curves

- **Type:** Wire[]
- **Required:** Yes

### V Curves

- **Type:** Wire[]
- **Required:** Yes

## Outputs

### Surface

- **Type:** Face

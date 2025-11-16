# FieldLine Node

**Category:** Field / Sample

Create field lines

## Parameters

### Step Size

- **Type:** number
- **Default:** 1
- **Min:** 0.01

### Max Steps

- **Type:** number
- **Default:** 1000
- **Min:** 10
- **Max:** 10000

### Direction

- **Type:** enum
- **Default:** "forward"

## Inputs

### Field

- **Type:** VectorField
- **Required:** Yes

### Seeds

- **Type:** Point[]
- **Required:** Yes

## Outputs

### Lines

- **Type:** Wire[]

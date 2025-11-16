# CollisionDetection Node

**Category:** Fabrication / CNC

Tool collision checking

## Parameters

### Tool Length

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 200

### Holder Diameter

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 100

## Inputs

### Toolpath

- **Type:** Wire[]
- **Required:** Yes

### Model

- **Type:** Shape
- **Required:** Yes

## Outputs

### Collisions

- **Type:** Point[]

### Safe Path

- **Type:** Wire[]

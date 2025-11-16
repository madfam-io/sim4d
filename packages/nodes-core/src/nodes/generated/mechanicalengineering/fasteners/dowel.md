# Dowel Node

**Category:** MechanicalEngineering / Fasteners

Create dowel pin

## Parameters

### Diameter

- **Type:** number
- **Default:** 6
- **Min:** 2
- **Max:** 20

### Length

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 100

### Tolerance

- **Type:** enum
- **Default:** "h7"

### Chamfered

- **Type:** boolean
- **Default:** true

## Inputs

### Position

- **Type:** Point
- **Required:** Yes

### Direction

- **Type:** Vector
- **Required:** No

## Outputs

### Dowel

- **Type:** Shape

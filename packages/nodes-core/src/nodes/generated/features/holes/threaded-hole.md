# ThreadedHole Node

**Category:** Features / Holes

Creates a threaded (tapped) hole

## Parameters

### Thread Size

- **Type:** enum
- **Default:** "M6"

- **Description:** Thread size

### Pitch

- **Type:** number
- **Default:** 1
- **Min:** 0.25
- **Max:** 3
- **Description:** Thread pitch

### Depth

- **Type:** number
- **Default:** 20
- **Min:** 1
- **Max:** 1000

### Thread Class

- **Type:** enum
- **Default:** "6H"

- **Description:** Thread tolerance class

## Inputs

### Solid

- **Type:** Shape
- **Required:** Yes

### Position

- **Type:** Point
- **Required:** Yes

## Outputs

### Shape

- **Type:** Shape

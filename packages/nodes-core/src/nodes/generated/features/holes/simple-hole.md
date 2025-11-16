# SimpleHole Node

**Category:** Features / Holes

Creates a simple through hole

## Parameters

### Diameter

- **Type:** number
- **Default:** 10
- **Min:** 0.1
- **Max:** 1000
- **Description:** Hole diameter in mm

### Depth

- **Type:** number
- **Default:** -1
- **Min:** -1

- **Description:** Hole depth (-1 for through hole)

## Inputs

### Solid

- **Type:** Shape
- **Required:** Yes
- **Description:** Solid to create hole in

### Position

- **Type:** Point
- **Required:** Yes
- **Description:** Hole center position

### Direction

- **Type:** Vector
- **Required:** No
- **Description:** Hole direction (default: -Z)

## Outputs

### Shape

- **Type:** Shape
- **Description:** Solid with hole

## Examples

### M6 Clearance Hole

Parameters:

```json
{
  "diameter": 6.5,
  "depth": -1
}
```

### M10 Tapped Hole

Parameters:

```json
{
  "diameter": 8.5,
  "depth": 20
}
```

# RectangularPocket Node

**Category:** Features / Pockets

Creates a rectangular pocket with optional corner radius

## Parameters

### Width

- **Type:** number
- **Default:** 50
- **Min:** 0.1
- **Max:** 10000

### Height

- **Type:** number
- **Default:** 30
- **Min:** 0.1
- **Max:** 10000

### Depth

- **Type:** number
- **Default:** 10
- **Min:** 0.1
- **Max:** 1000

### Corner Radius

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 100
- **Description:** Corner radius (0 for sharp corners)

### Draft Angle

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 45
- **Description:** Draft angle for molding

## Inputs

### Face

- **Type:** Face
- **Required:** Yes
- **Description:** Face to create pocket on

### Position

- **Type:** Point
- **Required:** Yes
- **Description:** Pocket center position

## Outputs

### Shape

- **Type:** Shape

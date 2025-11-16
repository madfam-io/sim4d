# SingleDoor Node

**Category:** Architecture / Doors

Single swing door

## Parameters

### Width

- **Type:** number
- **Default:** 900
- **Min:** 600
- **Max:** 1200

### Height

- **Type:** number
- **Default:** 2100
- **Min:** 1800
- **Max:** 2400

### Thickness

- **Type:** number
- **Default:** 45
- **Min:** 35
- **Max:** 60

### Swing

- **Type:** enum
- **Default:** "right"

### Opening

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 90

## Inputs

### Position

- **Type:** Point
- **Required:** Yes

### Wall

- **Type:** Shape
- **Required:** No

## Outputs

### Door

- **Type:** Shape

### Frame

- **Type:** Shape

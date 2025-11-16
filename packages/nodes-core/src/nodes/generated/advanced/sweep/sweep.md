# Sweep Node

**Category:** Advanced / Sweep

Sweep profile along path

## Parameters

### Twist Angle

- **Type:** number
- **Default:** 0
- **Min:** -360
- **Max:** 360
- **Description:** Twist along path

### Scale Factor

- **Type:** number
- **Default:** 1
- **Min:** 0.01
- **Max:** 100
- **Description:** Scale at end

### Keep Orientation

- **Type:** boolean
- **Default:** false

### Solid

- **Type:** boolean
- **Default:** true

- **Description:** Create solid or surface

## Inputs

### Profile

- **Type:** Wire
- **Required:** Yes

### Path

- **Type:** Wire
- **Required:** Yes

### Auxiliary Spine

- **Type:** Wire
- **Required:** No

## Outputs

### Shape

- **Type:** Shape

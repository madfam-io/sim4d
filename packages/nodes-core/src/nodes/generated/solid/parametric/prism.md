# Prism Node

**Category:** Solid / Parametric

Create a prism from a profile and height

## Parameters

### Height

- **Type:** number
- **Default:** 100
- **Min:** 0.1
- **Max:** 10000
- **Description:** Prism height

### Twist

- **Type:** number
- **Default:** 0
- **Min:** -360
- **Max:** 360
- **Description:** Twist angle in degrees

### Taper

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10
- **Description:** Taper ratio

## Inputs

### Profile

- **Type:** Wire
- **Required:** Yes
- **Description:** Base profile

## Outputs

### Solid

- **Type:** Solid
- **Description:** Generated prism

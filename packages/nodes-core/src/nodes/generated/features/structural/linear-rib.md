# LinearRib Node

**Category:** Features / Structural

Creates a reinforcing rib along a path

## Parameters

### Thickness

- **Type:** number
- **Default:** 3
- **Min:** 0.1
- **Max:** 100

### Height

- **Type:** number
- **Default:** 20
- **Min:** 0.1
- **Max:** 1000

### Draft Angle

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 10
- **Description:** Draft angle for molding

### Top Radius

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 50
- **Description:** Top edge fillet radius

## Inputs

### Face

- **Type:** Face
- **Required:** Yes
- **Description:** Base face for rib

### Path

- **Type:** Curve
- **Required:** Yes
- **Description:** Path for rib

## Outputs

### Shape

- **Type:** Shape

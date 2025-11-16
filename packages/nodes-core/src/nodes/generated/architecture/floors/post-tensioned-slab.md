# PostTensionedSlab Node

**Category:** Architecture / Floors

Post-tensioned concrete slab

## Parameters

### Slab Thickness

- **Type:** number
- **Default:** 200
- **Min:** 150
- **Max:** 400

### Tendon Spacing

- **Type:** number
- **Default:** 1200
- **Min:** 900
- **Max:** 1800

## Inputs

### Slab Outline

- **Type:** Wire
- **Required:** Yes

### Column Points

- **Type:** Point[]
- **Required:** No

## Outputs

### Pt Slab

- **Type:** Shape

### Tendons

- **Type:** Wire[]

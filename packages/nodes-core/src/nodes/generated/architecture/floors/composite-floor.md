# CompositeFloor Node

**Category:** Architecture / Floors

Steel deck composite floor

## Parameters

### Deck Type

- **Type:** enum
- **Default:** "3-inch"

### Concrete Thickness

- **Type:** number
- **Default:** 100
- **Min:** 75
- **Max:** 200

## Inputs

### Floor Outline

- **Type:** Wire
- **Required:** Yes

### Beams

- **Type:** Wire[]
- **Required:** Yes

## Outputs

### Composite Floor

- **Type:** Shape

### Deck

- **Type:** Shape

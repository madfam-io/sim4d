# Fold Node

**Category:** SheetMetal / Unfold

Fold flat pattern to 3D

## Parameters

### Fold Sequence

- **Type:** string
- **Default:** "auto"

- **Description:** Bend sequence order

### Partial Fold

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 1
- **Description:** Fold completion ratio

## Inputs

### Flat Pattern

- **Type:** Shape
- **Required:** Yes

### Bend Lines

- **Type:** Edge[]
- **Required:** Yes

### Bend Angles

- **Type:** number[]
- **Required:** Yes

## Outputs

### Folded Shape

- **Type:** Shape

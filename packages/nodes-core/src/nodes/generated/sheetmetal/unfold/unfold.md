# Unfold Node

**Category:** SheetMetal / Unfold

Unfold sheet metal to flat pattern

## Parameters

### K Factor

- **Type:** number
- **Default:** 0.44
- **Min:** 0
- **Max:** 1
- **Description:** Neutral axis position

### Bend Allowance

- **Type:** number
- **Default:** 0
- **Min:** -10
- **Max:** 10

### Auto Relief

- **Type:** boolean
- **Default:** true

## Inputs

### Folded Shape

- **Type:** Shape
- **Required:** Yes

### Fixed Face

- **Type:** Face
- **Required:** No
- **Description:** Face to keep fixed

## Outputs

### Flat Pattern

- **Type:** Shape

### Bend Lines

- **Type:** Edge[]

### Bend Table

- **Type:** Data
- **Description:** Bend sequence information

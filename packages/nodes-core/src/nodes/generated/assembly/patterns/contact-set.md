# ContactSet Node

**Category:** Assembly / Patterns

Define contact sets

## Parameters

### Type

- **Type:** enum
- **Default:** "no_penetration"

### Friction

- **Type:** number
- **Default:** 0.3
- **Min:** 0
- **Max:** 1

## Inputs

### Faces1

- **Type:** Face[]
- **Required:** Yes

### Faces2

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Contact Set

- **Type:** ContactSet

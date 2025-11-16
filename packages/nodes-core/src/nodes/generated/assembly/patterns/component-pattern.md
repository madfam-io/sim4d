# ComponentPattern Node

**Category:** Assembly / Patterns

Pattern components in assembly

## Parameters

### Pattern Type

- **Type:** enum
- **Default:** "linear"

### Count

- **Type:** number
- **Default:** 3
- **Min:** 2
- **Max:** 100

### Spacing

- **Type:** number
- **Default:** 100
- **Min:** 0.1
- **Max:** 10000

## Inputs

### Component

- **Type:** Shape
- **Required:** Yes

### Mates

- **Type:** Mate[]
- **Required:** No

## Outputs

### Pattern

- **Type:** Shape[]

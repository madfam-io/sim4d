# StainedGlassWindow Node

**Category:** Architecture / Windows

Stained glass window

## Parameters

### Pattern

- **Type:** enum
- **Default:** "geometric"

### Lead Width

- **Type:** number
- **Default:** 6
- **Min:** 4
- **Max:** 10

## Inputs

### Opening

- **Type:** Wire
- **Required:** Yes

### Pattern

- **Type:** Wire[]
- **Required:** No

## Outputs

### Stained Glass

- **Type:** Shape

### Lead Came

- **Type:** Wire[]

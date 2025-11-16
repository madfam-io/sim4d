# LinearArray Node

**Category:** Transform

Create linear array of shapes

## Parameters

### Count

- **Type:** number
- **Default:** 5
- **Min:** 2
- **Max:** 1000

### Spacing X

- **Type:** number
- **Default:** 100
- **Min:** -10000
- **Max:** 10000

### Spacing Y

- **Type:** number
- **Default:** 0
- **Min:** -10000
- **Max:** 10000

### Spacing Z

- **Type:** number
- **Default:** 0
- **Min:** -10000
- **Max:** 10000

### Merge

- **Type:** boolean
- **Default:** false

- **Description:** Merge into single shape

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

## Outputs

### Array

- **Type:** Shape[]
- **Description:** Array of shapes

### Merged

- **Type:** Shape
- **Description:** Merged result (if merge=true)

# PathArray Node

**Category:** Transform

Array shapes along a path

## Parameters

### Count

- **Type:** number
- **Default:** 10
- **Min:** 2
- **Max:** 1000

### Align To Path

- **Type:** boolean
- **Default:** true

### Spacing

- **Type:** enum
- **Default:** "equal"

### Distance

- **Type:** number
- **Default:** 50
- **Min:** 0.1
- **Max:** 10000

### Merge

- **Type:** boolean
- **Default:** false

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

### Path

- **Type:** Wire
- **Required:** Yes
- **Description:** Path curve

## Outputs

### Array

- **Type:** Shape[]

### Merged

- **Type:** Shape

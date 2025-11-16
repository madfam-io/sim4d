# Shell Node

**Category:** Advanced / Shell

Hollow out solid

## Parameters

### Thickness

- **Type:** number
- **Default:** 2
- **Min:** 0.01
- **Max:** 1000
- **Description:** Wall thickness

### Direction

- **Type:** enum
- **Default:** "inward"

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.0001
- **Max:** 1

## Inputs

### Solid

- **Type:** Shape
- **Required:** Yes

### Faces To Remove

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Shell

- **Type:** Shape

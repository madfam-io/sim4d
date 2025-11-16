# Union Node

**Category:** Boolean

Combine multiple shapes into one

## Parameters

### Keep Originals

- **Type:** boolean
- **Default:** false

- **Description:** Keep original shapes

### Fuzzy Value

- **Type:** number
- **Default:** 1e-7
- **Min:** 0
- **Max:** 1
- **Description:** Tolerance for fuzzy boolean

## Inputs

### Shapes

- **Type:** Shape[]
- **Required:** Yes
- **Description:** Shapes to unite

## Outputs

### Result

- **Type:** Shape
- **Description:** United shape

## Examples

### Simple Union

Parameters:

```json
{
  "keepOriginals": false
}
```

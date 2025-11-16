# LinearPattern Node

**Category:** Transform / Patterns

Creates a linear array of features or shapes

## Parameters

### Count

- **Type:** number
- **Default:** 5
- **Min:** 2
- **Max:** 1000
- **Description:** Number of instances

### Spacing

- **Type:** number
- **Default:** 20
- **Min:** 0.1
- **Max:** 10000
- **Description:** Distance between instances

### Direction

- **Type:** vector3
- **Default:** [1,0,0]

- **Description:** Pattern direction vector

### Centered

- **Type:** boolean
- **Default:** false

- **Description:** Center pattern around origin

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes
- **Description:** Shape or feature to pattern

## Outputs

### Shapes

- **Type:** Shape[]
- **Description:** Array of patterned shapes

### Compound

- **Type:** Shape
- **Description:** Compound shape of all instances

## Examples

### Hole Pattern

Parameters:

```json
{
  "count": 10,
  "spacing": 15,
  "direction": [1, 0, 0]
}
```

### Centered Array

Parameters:

```json
{
  "count": 7,
  "spacing": 25,
  "centered": true
}
```

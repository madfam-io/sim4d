# Box Node

**Category:** Solid / Primitives

Create a parametric box/cuboid

## Parameters

### Width

- **Type:** number
- **Default:** 100
- **Min:** 0.1
- **Max:** 10000
- **Description:** Width (X dimension)

### Depth

- **Type:** number
- **Default:** 100
- **Min:** 0.1
- **Max:** 10000
- **Description:** Depth (Y dimension)

### Height

- **Type:** number
- **Default:** 100
- **Min:** 0.1
- **Max:** 10000
- **Description:** Height (Z dimension)

### Center X

- **Type:** number
- **Default:** 0
- **Min:** -10000
- **Max:** 10000

### Center Y

- **Type:** number
- **Default:** 0
- **Min:** -10000
- **Max:** 10000

### Center Z

- **Type:** number
- **Default:** 0
- **Min:** -10000
- **Max:** 10000

## Inputs

This node has no inputs.

## Outputs

### Solid

- **Type:** Solid
- **Description:** Generated box

## Examples

### Unit Cube

Parameters:

```json
{
  "width": 1,
  "depth": 1,
  "height": 1
}
```

### Rectangular Block

Parameters:

```json
{
  "width": 200,
  "depth": 100,
  "height": 50
}
```

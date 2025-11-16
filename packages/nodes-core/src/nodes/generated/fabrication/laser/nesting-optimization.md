# NestingOptimization Node

**Category:** Fabrication / Laser

Optimize material nesting

## Parameters

### Spacing

- **Type:** number
- **Default:** 2
- **Min:** 0
- **Max:** 10

### Rotations

- **Type:** boolean
- **Default:** true

### Grain Direction

- **Type:** boolean
- **Default:** false

## Inputs

### Parts

- **Type:** Face[]
- **Required:** Yes

### Sheet

- **Type:** Face
- **Required:** Yes

## Outputs

### Nested Parts

- **Type:** Face[]

### Utilization

- **Type:** Number

# ShapeDescriptor Node

**Category:** Algorithmic / Geometry

Compute geometric shape descriptors

## Parameters

### Descriptor

- **Type:** enum
- **Default:** "moments"

### Resolution

- **Type:** number
- **Default:** 32
- **Min:** 8
- **Max:** 128

### Normalize

- **Type:** boolean
- **Default:** true

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

## Outputs

### Descriptor

- **Type:** number[]

### Features

- **Type:** Properties

### Similarity

- **Type:** number

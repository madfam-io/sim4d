# DXFImport Node

**Category:** Interoperability / Import

Import DXF 2D drawing files

## Parameters

### Units

- **Type:** enum
- **Default:** "auto"

### Layers

- **Type:** string
- **Default:** "all"

- **Description:** Comma-separated layer names

### Explode Blocks

- **Type:** boolean
- **Default:** false

## Inputs

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Curves

- **Type:** Wire[]

### Points

- **Type:** Point[]

### Texts

- **Type:** Properties[]

### Layers

- **Type:** string[]

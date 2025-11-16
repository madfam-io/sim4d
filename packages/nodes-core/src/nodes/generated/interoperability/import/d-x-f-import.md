# DXFImport Node

**Category:** Interoperability / Import

Import DXF 2D drawing files

## Parameters

### units

- **Type:** enum
- **Default:** "auto"

### layers

- **Type:** string
- **Default:** "all"

- **Description:** Comma-separated layer names

### explodeBlocks

- **Type:** boolean
- **Default:** false

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### curves

- **Type:** Wire[]

### points

- **Type:** Point[]

### texts

- **Type:** Properties[]

### layers

- **Type:** string[]

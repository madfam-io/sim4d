# DXFExport Node

**Category:** Interoperability / Export

Export 2D geometry to DXF format

## Parameters

### Version

- **Type:** enum
- **Default:** "2000"

### Units

- **Type:** enum
- **Default:** "mm"

### Layer Name

- **Type:** string
- **Default:** "BrepFlow"

## Inputs

### Curves

- **Type:** Wire[]
- **Required:** Yes

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### Entity Count

- **Type:** number

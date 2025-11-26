# DXFExport Node

**Category:** Interoperability / Export

Export 2D geometry to DXF format

## Parameters

### version

- **Type:** enum
- **Default:** "2000"

### units

- **Type:** enum
- **Default:** "mm"

### layerName

- **Type:** string
- **Default:** "Sim4D"

## Inputs

### curves

- **Type:** Wire[]
- **Required:** Yes

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### success

- **Type:** boolean

### entityCount

- **Type:** number

# ExportDXF Node

**Category:** IO / Drawing

Export to DXF format

## Parameters

### version

- **Type:** enum
- **Default:** "R2010"

### projection

- **Type:** enum
- **Default:** "top"

### hiddenLines

- **Type:** boolean
- **Default:** false

## Inputs

### shapes

- **Type:** Shape[]
- **Required:** Yes

### layers

- **Type:** Data
- **Required:** No

## Outputs

### dxfData

- **Type:** Data

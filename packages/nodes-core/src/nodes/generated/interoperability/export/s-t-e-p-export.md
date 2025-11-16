# STEPExport Node

**Category:** Interoperability / Export

Export geometry to STEP format

## Parameters

### version

- **Type:** enum
- **Default:** "AP214"

### units

- **Type:** enum
- **Default:** "mm"

### precision

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### writeMode

- **Type:** enum
- **Default:** "manifold"

## Inputs

### shapes

- **Type:** Shape[]
- **Required:** Yes

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### success

- **Type:** boolean

### fileSize

- **Type:** number

### exportLog

- **Type:** string[]

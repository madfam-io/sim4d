# IGESExport Node

**Category:** Interoperability / Export

Export geometry to IGES format

## Parameters

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
- **Default:** "brep"

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

### entityCount

- **Type:** number

# 3MFExport Node

**Category:** Interoperability / Export

Export to 3D Manufacturing Format

## Parameters

### units

- **Type:** enum
- **Default:** "mm"

### includeColors

- **Type:** boolean
- **Default:** true

### compression

- **Type:** boolean
- **Default:** true

## Inputs

### models

- **Type:** Shape[]
- **Required:** Yes

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### success

- **Type:** boolean

### modelCount

- **Type:** number

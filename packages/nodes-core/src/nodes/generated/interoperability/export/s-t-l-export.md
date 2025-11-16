# STLExport Node

**Category:** Interoperability / Export

Export mesh to STL format

## Parameters

### format

- **Type:** enum
- **Default:** "binary"

### deflection

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

### angularDeflection

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

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

### triangleCount

- **Type:** number

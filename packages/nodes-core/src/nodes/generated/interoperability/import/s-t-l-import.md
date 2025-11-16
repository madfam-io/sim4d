# STLImport Node

**Category:** Interoperability / Import

Import STL mesh files

## Parameters

### mergeVertices

- **Type:** boolean
- **Default:** true

### tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### units

- **Type:** enum
- **Default:** "mm"

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### mesh

- **Type:** Shape

### triangleCount

- **Type:** number

### vertexCount

- **Type:** number

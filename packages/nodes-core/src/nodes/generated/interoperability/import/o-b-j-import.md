# OBJImport Node

**Category:** Interoperability / Import

Import Wavefront OBJ files

## Parameters

### scale

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### flipNormals

- **Type:** boolean
- **Default:** false

### loadMaterials

- **Type:** boolean
- **Default:** true

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### meshes

- **Type:** Shape[]

### materials

- **Type:** Properties[]

### groups

- **Type:** string[]

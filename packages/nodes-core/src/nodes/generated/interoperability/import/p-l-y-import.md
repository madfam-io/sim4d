# PLYImport Node

**Category:** Interoperability / Import

Import PLY point cloud files

## Parameters

### loadColors

- **Type:** boolean
- **Default:** true

### loadNormals

- **Type:** boolean
- **Default:** true

### scaleFactor

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### points

- **Type:** Point[]

### colors

- **Type:** number[][]

### normals

- **Type:** Vector[]

# PLYExport Node

**Category:** Interoperability / Export

Export point cloud to PLY format

## Parameters

### format

- **Type:** enum
- **Default:** "binary"

### includeColors

- **Type:** boolean
- **Default:** false

### includeNormals

- **Type:** boolean
- **Default:** false

## Inputs

### points

- **Type:** Point[]
- **Required:** Yes

### filePath

- **Type:** string
- **Required:** Yes

### colors

- **Type:** number[][]
- **Required:** No

### normals

- **Type:** Vector[]
- **Required:** No

## Outputs

### success

- **Type:** boolean

### pointCount

- **Type:** number

# PLYExport Node

**Category:** Interoperability / Export

Export point cloud to PLY format

## Parameters

### Format

- **Type:** enum
- **Default:** "binary"

### Include Colors

- **Type:** boolean
- **Default:** false

### Include Normals

- **Type:** boolean
- **Default:** false

## Inputs

### Points

- **Type:** Point[]
- **Required:** Yes

### File Path

- **Type:** string
- **Required:** Yes

### Colors

- **Type:** number[][]
- **Required:** No

### Normals

- **Type:** Vector[]
- **Required:** No

## Outputs

### Success

- **Type:** boolean

### Point Count

- **Type:** number

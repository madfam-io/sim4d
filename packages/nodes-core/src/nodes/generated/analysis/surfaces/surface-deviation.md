# SurfaceDeviation Node

**Category:** Analysis / Surfaces

Compare surface deviation from reference

## Parameters

### Samples

- **Type:** number
- **Default:** 100
- **Min:** 20
- **Max:** 500

### Color Map

- **Type:** boolean
- **Default:** true

### Tolerance

- **Type:** number
- **Default:** 0.1
- **Min:** 0.001
- **Max:** 10

## Inputs

### Test Surface

- **Type:** Face
- **Required:** Yes

### Reference Surface

- **Type:** Face
- **Required:** Yes

## Outputs

### Deviation Map

- **Type:** Shape

### Max Deviation

- **Type:** number

### Average Deviation

- **Type:** number

### Deviation Points

- **Type:** Point[]

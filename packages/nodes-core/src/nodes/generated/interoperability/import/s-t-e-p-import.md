# STEPImport Node

**Category:** Interoperability / Import

Import STEP (.stp) CAD files

## Parameters

### units

- **Type:** enum
- **Default:** "auto"

### healGeometry

- **Type:** boolean
- **Default:** true

### precision

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### mergeSurfaces

- **Type:** boolean
- **Default:** false

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### shapes

- **Type:** Shape[]

### metadata

- **Type:** Properties

### units

- **Type:** string

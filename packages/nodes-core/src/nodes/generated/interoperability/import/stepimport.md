# STEPImport Node

**Category:** Interoperability / Import

Import STEP (.stp) CAD files

## Parameters

### Units

- **Type:** enum
- **Default:** "auto"

### Heal Geometry

- **Type:** boolean
- **Default:** true

### Precision

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Merge Surfaces

- **Type:** boolean
- **Default:** false

## Inputs

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Shapes

- **Type:** Shape[]

### Metadata

- **Type:** Properties

### Units

- **Type:** string

# STEPExport Node

**Category:** Interoperability / Export

Export geometry to STEP format

## Parameters

### Version

- **Type:** enum
- **Default:** "AP214"

### Units

- **Type:** enum
- **Default:** "mm"

### Precision

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Write Mode

- **Type:** enum
- **Default:** "manifold"

## Inputs

### Shapes

- **Type:** Shape[]
- **Required:** Yes

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### File Size

- **Type:** number

### Export Log

- **Type:** string[]

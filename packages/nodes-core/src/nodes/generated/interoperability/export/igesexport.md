# IGESExport Node

**Category:** Interoperability / Export

Export geometry to IGES format

## Parameters

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
- **Default:** "brep"

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

### Entity Count

- **Type:** number

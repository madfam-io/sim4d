# STLExport Node

**Category:** Interoperability / Export

Export mesh to STL format

## Parameters

### Format

- **Type:** enum
- **Default:** "binary"

### Deflection

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

### Angular Deflection

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

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

### Triangle Count

- **Type:** number

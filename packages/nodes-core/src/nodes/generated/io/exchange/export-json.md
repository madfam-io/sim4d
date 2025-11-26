# ExportJSON Node

**Category:** IO / Exchange

Export geometry to JSON

## Parameters

### Format

- **Type:** enum
- **Default:** "sim4d"

### Precision

- **Type:** number
- **Default:** 6
- **Min:** 1
- **Max:** 15

### Include Topology

- **Type:** boolean
- **Default:** true

## Inputs

### Shapes

- **Type:** Shape[]
- **Required:** Yes

### Metadata

- **Type:** Data
- **Required:** No

## Outputs

### Json Data

- **Type:** string

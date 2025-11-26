# ExportJSON Node

**Category:** IO / Exchange

Export geometry to JSON

## Parameters

### format

- **Type:** enum
- **Default:** "sim4d"

### precision

- **Type:** number
- **Default:** 6
- **Min:** 1
- **Max:** 15

### includeTopology

- **Type:** boolean
- **Default:** true

## Inputs

### shapes

- **Type:** Shape[]
- **Required:** Yes

### metadata

- **Type:** Data
- **Required:** No

## Outputs

### jsonData

- **Type:** string

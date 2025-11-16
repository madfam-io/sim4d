# CSVWriter Node

**Category:** Interoperability / Data

Write data to CSV files

## Parameters

### delimiter

- **Type:** string
- **Default:** ","

### includeHeader

- **Type:** boolean
- **Default:** true

### encoding

- **Type:** enum
- **Default:** "utf-8"

## Inputs

### data

- **Type:** Properties[]
- **Required:** Yes

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### success

- **Type:** boolean

### rowsWritten

- **Type:** number

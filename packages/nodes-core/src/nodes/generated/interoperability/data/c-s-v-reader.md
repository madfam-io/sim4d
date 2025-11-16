# CSVReader Node

**Category:** Interoperability / Data

Read CSV data files

## Parameters

### delimiter

- **Type:** string
- **Default:** ","

- **Description:** Field delimiter

### hasHeader

- **Type:** boolean
- **Default:** true

### encoding

- **Type:** enum
- **Default:** "utf-8"

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### data

- **Type:** Properties[]

### headers

- **Type:** string[]

### rowCount

- **Type:** number

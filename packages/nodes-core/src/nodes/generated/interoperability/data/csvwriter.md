# CSVWriter Node

**Category:** Interoperability / Data

Write data to CSV files

## Parameters

### Delimiter

- **Type:** string
- **Default:** ","

### Include Header

- **Type:** boolean
- **Default:** true

### Encoding

- **Type:** enum
- **Default:** "utf-8"

## Inputs

### Data

- **Type:** Properties[]
- **Required:** Yes

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### Rows Written

- **Type:** number

# ExcelWriter Node

**Category:** Interoperability / Data

Write data to Excel files

## Parameters

### Sheet Name

- **Type:** string
- **Default:** "Sheet1"

### Include Header

- **Type:** boolean
- **Default:** true

### Start Cell

- **Type:** string
- **Default:** "A1"

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

### Cells Written

- **Type:** number

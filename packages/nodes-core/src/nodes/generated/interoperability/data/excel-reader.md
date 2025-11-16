# ExcelReader Node

**Category:** Interoperability / Data

Read Excel spreadsheet files

## Parameters

### Sheet Name

- **Type:** string
- **Default:** ""

- **Description:** Sheet name (empty for first)

### Has Header

- **Type:** boolean
- **Default:** true

### Range

- **Type:** string
- **Default:** ""

- **Description:** Cell range (e.g., A1:C10)

## Inputs

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Data

- **Type:** Properties[]

### Sheet Names

- **Type:** string[]

### Dimensions

- **Type:** number[]

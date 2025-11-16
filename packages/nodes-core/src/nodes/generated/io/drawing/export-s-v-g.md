# ExportSVG Node

**Category:** IO / Drawing

Export to SVG format

## Parameters

### projection

- **Type:** enum
- **Default:** "top"

### width

- **Type:** number
- **Default:** 800
- **Min:** 100
- **Max:** 10000

### height

- **Type:** number
- **Default:** 600
- **Min:** 100
- **Max:** 10000

### strokeWidth

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

### fillOpacity

- **Type:** number
- **Default:** 0.3
- **Min:** 0
- **Max:** 1

## Inputs

### shapes

- **Type:** Shape[]
- **Required:** Yes

## Outputs

### svgData

- **Type:** string

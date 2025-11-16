# ExportSVG Node

**Category:** IO / Drawing

Export to SVG format

## Parameters

### Projection

- **Type:** enum
- **Default:** "top"

### Width

- **Type:** number
- **Default:** 800
- **Min:** 100
- **Max:** 10000

### Height

- **Type:** number
- **Default:** 600
- **Min:** 100
- **Max:** 10000

### Stroke Width

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

### Fill Opacity

- **Type:** number
- **Default:** 0.3
- **Min:** 0
- **Max:** 1

## Inputs

### Shapes

- **Type:** Shape[]
- **Required:** Yes

## Outputs

### Svg Data

- **Type:** string

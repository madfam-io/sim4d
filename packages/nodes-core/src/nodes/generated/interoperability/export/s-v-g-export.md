# SVGExport Node

**Category:** Interoperability / Export

Export 2D curves to SVG format

## Parameters

### scale

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### strokeWidth

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

### viewBox

- **Type:** boolean
- **Default:** true

## Inputs

### curves

- **Type:** Wire[]
- **Required:** Yes

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### success

- **Type:** boolean

### dimensions

- **Type:** Vector

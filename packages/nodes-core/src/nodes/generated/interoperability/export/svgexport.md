# SVGExport Node

**Category:** Interoperability / Export

Export 2D curves to SVG format

## Parameters

### Scale

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### Stroke Width

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

### View Box

- **Type:** boolean
- **Default:** true

## Inputs

### Curves

- **Type:** Wire[]
- **Required:** Yes

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### Dimensions

- **Type:** Vector

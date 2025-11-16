# SVGImport Node

**Category:** Interoperability / Import

Import SVG vector graphics

## Parameters

### scale

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### tolerance

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

### flatten

- **Type:** boolean
- **Default:** true

- **Description:** Flatten to single plane

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### curves

- **Type:** Wire[]

### closed

- **Type:** Wire[]

### open

- **Type:** Wire[]

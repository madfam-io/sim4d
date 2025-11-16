# SVGImport Node

**Category:** Interoperability / Import

Import SVG vector graphics

## Parameters

### Scale

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### Tolerance

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

### Flatten

- **Type:** boolean
- **Default:** true

- **Description:** Flatten to single plane

## Inputs

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Curves

- **Type:** Wire[]

### Closed

- **Type:** Wire[]

### Open

- **Type:** Wire[]

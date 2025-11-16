# ContouringToolpath Node

**Category:** Fabrication / CNC

Contour machining paths

## Parameters

### Levels

- **Type:** number
- **Default:** 10
- **Min:** 1
- **Max:** 100

### Climb

- **Type:** boolean
- **Default:** true

### Compensation

- **Type:** enum
- **Default:** "right"

## Inputs

### Surface

- **Type:** Face
- **Required:** Yes

## Outputs

### Contours

- **Type:** Wire[]

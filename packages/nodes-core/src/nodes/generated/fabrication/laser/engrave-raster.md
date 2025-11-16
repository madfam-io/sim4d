# EngraveRaster Node

**Category:** Fabrication / Laser

Generate raster engraving

## Parameters

### Resolution

- **Type:** number
- **Default:** 300
- **Min:** 100
- **Max:** 1200

### Dithering

- **Type:** enum
- **Default:** "floyd-steinberg"

## Inputs

### Image

- **Type:** Data
- **Required:** Yes

### Boundary

- **Type:** Wire
- **Required:** Yes

## Outputs

### Raster Data

- **Type:** Data

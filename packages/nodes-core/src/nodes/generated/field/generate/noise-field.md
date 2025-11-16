# NoiseField Node

**Category:** Field / Generate

Noise-based field

## Parameters

### Type

- **Type:** enum
- **Default:** "perlin"

### Scale

- **Type:** number
- **Default:** 10
- **Min:** 0.1

### Octaves

- **Type:** number
- **Default:** 4
- **Min:** 1
- **Max:** 8

### Persistence

- **Type:** number
- **Default:** 0.5
- **Min:** 0
- **Max:** 1

### Seed

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 999999

## Inputs

### Domain

- **Type:** Box
- **Required:** Yes

## Outputs

### Field

- **Type:** ScalarField

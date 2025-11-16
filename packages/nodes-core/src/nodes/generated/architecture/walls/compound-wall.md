# CompoundWall Node

**Category:** Architecture / Walls

Multi-layer wall assembly

## Parameters

### Layers

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 10

### Layer Thicknesses

- **Type:** string
- **Default:** "100,50,100"

### Layer Materials

- **Type:** string
- **Default:** "brick,insulation,drywall"

## Inputs

### Path

- **Type:** Wire
- **Required:** Yes

## Outputs

### Compound Wall

- **Type:** Shape

### Layers

- **Type:** Shape[]

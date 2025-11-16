# BoundaryLayers Node

**Category:** Simulation / CFD

Add boundary layer mesh

## Parameters

### First Layer Height

- **Type:** number
- **Default:** 0.01
- **Min:** 0.0001
- **Max:** 1

### Growth Rate

- **Type:** number
- **Default:** 1.2
- **Min:** 1
- **Max:** 2

### Number Of Layers

- **Type:** number
- **Default:** 5
- **Min:** 1
- **Max:** 20

### Transition Ratio

- **Type:** number
- **Default:** 0.5
- **Min:** 0.1
- **Max:** 1

## Inputs

### Mesh

- **Type:** Mesh
- **Required:** Yes

### Wall Faces

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Layered Mesh

- **Type:** Mesh

# MeshForFEA Node

**Category:** Simulation / FEA

Generate FEA-ready mesh

## Parameters

### elementType

- **Type:** enum
- **Default:** "auto"

### elementSize

- **Type:** number
- **Default:** 5
- **Min:** 0.1
- **Max:** 100

### refinementZones

- **Type:** boolean
- **Default:** true

### qualityTarget

- **Type:** number
- **Default:** 0.8
- **Min:** 0.3
- **Max:** 1

## Inputs

### shape

- **Type:** Shape
- **Required:** Yes

### refinementRegions

- **Type:** Shape[]
- **Required:** No

## Outputs

### feaMesh

- **Type:** Mesh

### qualityReport

- **Type:** Data

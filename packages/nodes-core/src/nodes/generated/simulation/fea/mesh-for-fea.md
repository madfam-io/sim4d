# MeshForFEA Node

**Category:** Simulation / FEA

Generate FEA-ready mesh

## Parameters

### Element Type

- **Type:** enum
- **Default:** "auto"

### Element Size

- **Type:** number
- **Default:** 5
- **Min:** 0.1
- **Max:** 100

### Refinement Zones

- **Type:** boolean
- **Default:** true

### Quality Target

- **Type:** number
- **Default:** 0.8
- **Min:** 0.3
- **Max:** 1

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

### Refinement Regions

- **Type:** Shape[]
- **Required:** No

## Outputs

### Fea Mesh

- **Type:** Mesh

### Quality Report

- **Type:** Data

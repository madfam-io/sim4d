# ExportFEA Node

**Category:** Simulation / FEA

Export for FEA software

## Parameters

### format

- **Type:** enum
- **Default:** "nastran"

### includeLoads

- **Type:** boolean
- **Default:** true

### includeConstraints

- **Type:** boolean
- **Default:** true

### includeMaterials

- **Type:** boolean
- **Default:** true

## Inputs

### feaModel

- **Type:** Mesh
- **Required:** Yes

### analysisData

- **Type:** Data
- **Required:** No

## Outputs

### feaFile

- **Type:** Data

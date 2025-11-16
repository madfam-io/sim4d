# ExportFEA Node

**Category:** Simulation / FEA

Export for FEA software

## Parameters

### Format

- **Type:** enum
- **Default:** "nastran"

### Include Loads

- **Type:** boolean
- **Default:** true

### Include Constraints

- **Type:** boolean
- **Default:** true

### Include Materials

- **Type:** boolean
- **Default:** true

## Inputs

### Fea Model

- **Type:** Mesh
- **Required:** Yes

### Analysis Data

- **Type:** Data
- **Required:** No

## Outputs

### Fea File

- **Type:** Data

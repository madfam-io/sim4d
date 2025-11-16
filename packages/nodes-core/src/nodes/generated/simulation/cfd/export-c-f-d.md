# ExportCFD Node

**Category:** Simulation / CFD

Export for CFD software

## Parameters

### format

- **Type:** enum
- **Default:** "openfoam"

### meshFormat

- **Type:** enum
- **Default:** "polyhedral"

## Inputs

### cfdModel

- **Type:** Mesh
- **Required:** Yes

### setupData

- **Type:** Data
- **Required:** Yes

## Outputs

### cfdFiles

- **Type:** Data

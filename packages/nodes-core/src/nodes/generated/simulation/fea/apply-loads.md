# ApplyLoads Node

**Category:** Simulation / FEA

Define load conditions

## Parameters

### Load Type

- **Type:** enum
- **Default:** "force"

### Magnitude

- **Type:** number
- **Default:** 1000
- **Min:** 0
- **Max:** 1000000

### Direction

- **Type:** vector3
- **Default:** [0,0,-1]

### Units

- **Type:** enum
- **Default:** "N"

## Inputs

### Mesh

- **Type:** Mesh
- **Required:** Yes

### Application Faces

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Loaded Mesh

- **Type:** Mesh

### Load Data

- **Type:** Data

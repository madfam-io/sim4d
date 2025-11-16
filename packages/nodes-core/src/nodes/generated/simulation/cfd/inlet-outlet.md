# InletOutlet Node

**Category:** Simulation / CFD

Define inlet/outlet conditions

## Parameters

### Boundary Type

- **Type:** enum
- **Default:** "velocity-inlet"

### Velocity

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 1000
- **Description:** m/s

### Pressure

- **Type:** number
- **Default:** 101325
- **Min:** 0
- **Max:** 10000000
- **Description:** Pa

### Temperature

- **Type:** number
- **Default:** 293
- **Min:** 0
- **Max:** 1000
- **Description:** K

## Inputs

### Mesh

- **Type:** Mesh
- **Required:** Yes

### Boundary Faces

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Boundary Mesh

- **Type:** Mesh

### Boundary Data

- **Type:** Data

# ApplyConstraints Node

**Category:** Simulation / FEA

Define boundary conditions

## Parameters

### Constraint Type

- **Type:** enum
- **Default:** "fixed"

### Dof

- **Type:** boolean[]
- **Default:** [true,true,true,true,true,true]

- **Description:** X,Y,Z,RX,RY,RZ

## Inputs

### Mesh

- **Type:** Mesh
- **Required:** Yes

### Constraint Faces

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Constrained Mesh

- **Type:** Mesh

### Constraint Data

- **Type:** Data

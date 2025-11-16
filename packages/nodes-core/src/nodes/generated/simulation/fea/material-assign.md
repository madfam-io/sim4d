# MaterialAssign Node

**Category:** Simulation / FEA

Assign material properties

## Parameters

### Material

- **Type:** enum
- **Default:** "steel"

### Youngs Modulus

- **Type:** number
- **Default:** 200000
- **Min:** 1
- **Max:** 1000000
- **Description:** MPa

### Poissons Ratio

- **Type:** number
- **Default:** 0.3
- **Min:** 0
- **Max:** 0.5

### Density

- **Type:** number
- **Default:** 7850
- **Min:** 1
- **Max:** 20000
- **Description:** kg/m³

### Yield Strength

- **Type:** number
- **Default:** 250
- **Min:** 1
- **Max:** 5000
- **Description:** MPa

## Inputs

### Mesh

- **Type:** Mesh
- **Required:** Yes

### Bodies

- **Type:** Shape[]
- **Required:** No

## Outputs

### Materialized Mesh

- **Type:** Mesh

### Material Data

- **Type:** Data

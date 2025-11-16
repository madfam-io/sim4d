# ToleranceAnalysis Node

**Category:** Analysis / Quality

Analyze geometric tolerances

## Parameters

### Nominal Tolerance

- **Type:** number
- **Default:** 0.1
- **Min:** 0.001
- **Max:** 10

### Show Deviations

- **Type:** boolean
- **Default:** true

## Inputs

### Measured

- **Type:** Shape
- **Required:** Yes

### Nominal

- **Type:** Shape
- **Required:** Yes

## Outputs

### Within Tolerance

- **Type:** boolean

### Max Deviation

- **Type:** number

### Deviation Map

- **Type:** Shape

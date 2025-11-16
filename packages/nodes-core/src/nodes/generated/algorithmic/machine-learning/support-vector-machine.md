# SupportVectorMachine Node

**Category:** Algorithmic / MachineLearning

Support Vector Machine classifier

## Parameters

### Kernel

- **Type:** enum
- **Default:** "rbf"

### C

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### Gamma

- **Type:** enum
- **Default:** "scale"

## Inputs

### Training Data

- **Type:** Properties[]
- **Required:** Yes

### Features

- **Type:** string[]
- **Required:** Yes

### Target

- **Type:** string
- **Required:** Yes

## Outputs

### Model

- **Type:** Properties

### Support Vectors

- **Type:** Properties[]

### Accuracy

- **Type:** number

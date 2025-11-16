# DecisionTree Node

**Category:** Algorithmic / MachineLearning

Decision tree classifier

## Parameters

### Max Depth

- **Type:** number
- **Default:** 5
- **Min:** 1
- **Max:** 20

### Min Samples Split

- **Type:** number
- **Default:** 2
- **Min:** 2
- **Max:** 50

### Criterion

- **Type:** enum
- **Default:** "gini"

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

### Tree

- **Type:** Properties

### Accuracy

- **Type:** number

### Feature Importance

- **Type:** Properties

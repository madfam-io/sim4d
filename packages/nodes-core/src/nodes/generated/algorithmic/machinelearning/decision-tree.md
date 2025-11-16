# DecisionTree Node

**Category:** Algorithmic / MachineLearning

Decision tree classifier

## Parameters

### maxDepth

- **Type:** number
- **Default:** 5
- **Min:** 1
- **Max:** 20

### minSamplesSplit

- **Type:** number
- **Default:** 2
- **Min:** 2
- **Max:** 50

### criterion

- **Type:** enum
- **Default:** "gini"

## Inputs

### trainingData

- **Type:** Properties[]
- **Required:** Yes

### features

- **Type:** string[]
- **Required:** Yes

### target

- **Type:** string
- **Required:** Yes

## Outputs

### tree

- **Type:** Properties

### accuracy

- **Type:** number

### featureImportance

- **Type:** Properties

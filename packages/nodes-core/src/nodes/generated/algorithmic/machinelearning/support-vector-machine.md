# SupportVectorMachine Node

**Category:** Algorithmic / MachineLearning

Support Vector Machine classifier

## Parameters

### kernel

- **Type:** enum
- **Default:** "rbf"

### c

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 1000

### gamma

- **Type:** enum
- **Default:** "scale"

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

### model

- **Type:** Properties

### supportVectors

- **Type:** Properties[]

### accuracy

- **Type:** number

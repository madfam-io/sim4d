# NeuralNetwork Node

**Category:** Algorithmic / MachineLearning

Multi-layer perceptron neural network

## Parameters

### hiddenLayers

- **Type:** string
- **Default:** "10,5"

- **Description:** Comma-separated layer sizes

### activation

- **Type:** enum
- **Default:** "relu"

### learningRate

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### epochs

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

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

### loss

- **Type:** number[]

### accuracy

- **Type:** number

### predictions

- **Type:** number[]

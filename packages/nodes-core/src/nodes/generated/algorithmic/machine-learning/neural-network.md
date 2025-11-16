# NeuralNetwork Node

**Category:** Algorithmic / MachineLearning

Multi-layer perceptron neural network

## Parameters

### Hidden Layers

- **Type:** string
- **Default:** "10,5"

- **Description:** Comma-separated layer sizes

### Activation

- **Type:** enum
- **Default:** "relu"

### Learning Rate

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Epochs

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

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

### Loss

- **Type:** number[]

### Accuracy

- **Type:** number

### Predictions

- **Type:** number[]

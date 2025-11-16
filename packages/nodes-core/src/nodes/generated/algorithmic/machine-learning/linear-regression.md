# LinearRegression Node

**Category:** Algorithmic / MachineLearning

Linear regression analysis

## Parameters

### Regularization

- **Type:** enum
- **Default:** "none"

### Alpha

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 100

### Normalize

- **Type:** boolean
- **Default:** true

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

### Coefficients

- **Type:** number[]

### R Squared

- **Type:** number

### Predictions

- **Type:** number[]

# LinearRegression Node

**Category:** Algorithmic / MachineLearning

Linear regression analysis

## Parameters

### regularization

- **Type:** enum
- **Default:** "none"

### alpha

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 100

### normalize

- **Type:** boolean
- **Default:** true

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

### coefficients

- **Type:** number[]

### rSquared

- **Type:** number

### predictions

- **Type:** number[]

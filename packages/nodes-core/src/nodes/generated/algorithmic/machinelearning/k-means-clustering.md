# KMeansClustering Node

**Category:** Algorithmic / MachineLearning

K-means clustering algorithm

## Parameters

### clusters

- **Type:** number
- **Default:** 3
- **Min:** 2
- **Max:** 20

### maxIterations

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

### tolerance

- **Type:** number
- **Default:** 0.001
- **Min:** 0.000001
- **Max:** 0.1

### randomSeed

- **Type:** number
- **Default:** 42
- **Min:** 0
- **Max:** 1000

## Inputs

### data

- **Type:** Point[]
- **Required:** Yes

## Outputs

### centroids

- **Type:** Point[]

### labels

- **Type:** number[]

### clusters

- **Type:** Point[][]

### inertia

- **Type:** number

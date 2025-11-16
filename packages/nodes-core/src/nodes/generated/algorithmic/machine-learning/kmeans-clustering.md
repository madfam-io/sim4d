# KMeansClustering Node

**Category:** Algorithmic / MachineLearning

K-means clustering algorithm

## Parameters

### Clusters

- **Type:** number
- **Default:** 3
- **Min:** 2
- **Max:** 20

### Max Iterations

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

### Tolerance

- **Type:** number
- **Default:** 0.001
- **Min:** 0.000001
- **Max:** 0.1

### Random Seed

- **Type:** number
- **Default:** 42
- **Min:** 0
- **Max:** 1000

## Inputs

### Data

- **Type:** Point[]
- **Required:** Yes

## Outputs

### Centroids

- **Type:** Point[]

### Labels

- **Type:** number[]

### Clusters

- **Type:** Point[][]

### Inertia

- **Type:** number

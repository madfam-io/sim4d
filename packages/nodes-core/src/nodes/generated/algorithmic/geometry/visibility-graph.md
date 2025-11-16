# VisibilityGraph Node

**Category:** Algorithmic / Geometry

Compute visibility graph for path planning

## Parameters

### Epsilon

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Include Interior

- **Type:** boolean
- **Default:** false

## Inputs

### Obstacles

- **Type:** Shape[]
- **Required:** Yes

### Start

- **Type:** Point
- **Required:** Yes

### Goal

- **Type:** Point
- **Required:** Yes

## Outputs

### Graph

- **Type:** Wire[]

### Vertices

- **Type:** Point[]

### Edges

- **Type:** Properties[]

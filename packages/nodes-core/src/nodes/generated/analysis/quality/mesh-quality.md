# MeshQuality Node

**Category:** Analysis / Quality

Analyze mesh quality metrics

## Parameters

### Aspect Ratio Threshold

- **Type:** number
- **Default:** 5
- **Min:** 1
- **Max:** 20

### Skewness Threshold

- **Type:** number
- **Default:** 0.8
- **Min:** 0.1
- **Max:** 1

## Inputs

### Mesh

- **Type:** Shape
- **Required:** Yes

## Outputs

### Average Aspect Ratio

- **Type:** number

### Max Skewness

- **Type:** number

### Problem Elements

- **Type:** Shape[]

### Quality Report

- **Type:** Properties

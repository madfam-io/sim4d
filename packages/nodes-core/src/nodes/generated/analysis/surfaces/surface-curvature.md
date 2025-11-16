# SurfaceCurvature Node

**Category:** Analysis / Surfaces

Analyze surface curvature (Gaussian and Mean)

## Parameters

### U Samples

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 200

### V Samples

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 200

### Curvature Type

- **Type:** enum
- **Default:** "gaussian"

### Color Map

- **Type:** boolean
- **Default:** true

## Inputs

### Surface

- **Type:** Face
- **Required:** Yes

## Outputs

### Curvature Map

- **Type:** Shape

### Max Curvature

- **Type:** number

### Min Curvature

- **Type:** number

### Average Curvature

- **Type:** number

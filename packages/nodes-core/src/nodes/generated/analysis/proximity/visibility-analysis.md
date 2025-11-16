# VisibilityAnalysis Node

**Category:** Analysis / Proximity

Analyze line-of-sight visibility

## Parameters

### View Angle

- **Type:** number
- **Default:** 120
- **Min:** 10
- **Max:** 360

### Max Distance

- **Type:** number
- **Default:** 100
- **Min:** 1
- **Max:** 1000

## Inputs

### Viewpoint

- **Type:** Point
- **Required:** Yes

### Targets

- **Type:** Point[]
- **Required:** Yes

### Obstacles

- **Type:** Shape[]
- **Required:** No

## Outputs

### Visible Targets

- **Type:** Point[]

### Occluded Targets

- **Type:** Point[]

### Sight Lines

- **Type:** Wire[]

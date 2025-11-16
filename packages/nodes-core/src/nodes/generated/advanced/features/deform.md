# Deform Node

**Category:** Advanced / Features

Point deformation

## Parameters

### Deform Type

- **Type:** enum
- **Default:** "point"

### Radius

- **Type:** number
- **Default:** 50
- **Min:** 0.1
- **Max:** 1000

### Stiffness

- **Type:** number
- **Default:** 0.5
- **Min:** 0
- **Max:** 1

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

### Control Points

- **Type:** Point[]
- **Required:** Yes

### Target Points

- **Type:** Point[]
- **Required:** Yes

## Outputs

### Deformed

- **Type:** Shape

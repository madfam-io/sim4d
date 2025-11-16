# Draft Node

**Category:** Advanced / Draft

Add draft angle to faces

## Parameters

### Angle

- **Type:** number
- **Default:** 3
- **Min:** -30
- **Max:** 30
- **Description:** Draft angle in degrees

### Pull Direction

- **Type:** vector3
- **Default:** [0,0,1]

### Neutral Plane

- **Type:** vector3
- **Default:** [0,0,0]

## Inputs

### Solid

- **Type:** Shape
- **Required:** Yes

### Faces To Draft

- **Type:** Face[]
- **Required:** Yes

## Outputs

### Drafted

- **Type:** Shape

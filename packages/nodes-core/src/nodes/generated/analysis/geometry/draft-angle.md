# DraftAngle Node

**Category:** Analysis / Geometry

Analyze draft angles for molding

## Parameters

### pullDirection

- **Type:** vector3
- **Default:** [0,0,1]

### minAngle

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 90

### maxAngle

- **Type:** number
- **Default:** 10
- **Min:** 0
- **Max:** 90

## Inputs

### solid

- **Type:** Solid
- **Required:** Yes

## Outputs

### validFaces

- **Type:** Face[]
- **Description:** Faces with valid draft

### invalidFaces

- **Type:** Face[]
- **Description:** Faces needing draft correction

### verticalFaces

- **Type:** Face[]
- **Description:** Vertical faces

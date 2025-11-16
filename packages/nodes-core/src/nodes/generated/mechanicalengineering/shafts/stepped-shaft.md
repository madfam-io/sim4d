# SteppedShaft Node

**Category:** MechanicalEngineering / Shafts

Create stepped shaft

## Parameters

### Sections

- **Type:** string
- **Default:** "20x50,25x80,20x30"

- **Description:** Diameter x Length pairs

### Chamfers

- **Type:** boolean
- **Default:** true

### Fillet Radius

- **Type:** number
- **Default:** 1
- **Min:** 0.5
- **Max:** 5

## Inputs

### Centerline

- **Type:** Wire
- **Required:** Yes

## Outputs

### Shaft

- **Type:** Shape

### Sections

- **Type:** Shape[]

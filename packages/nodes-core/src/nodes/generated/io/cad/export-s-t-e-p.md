# ExportSTEP Node

**Category:** IO / CAD

Export to STEP format

## Parameters

### version

- **Type:** enum
- **Default:** "AP214"

### writeColors

- **Type:** boolean
- **Default:** true

### writeNames

- **Type:** boolean
- **Default:** true

### writeLayers

- **Type:** boolean
- **Default:** true

### units

- **Type:** enum
- **Default:** "mm"

## Inputs

### shape

- **Type:** Shape
- **Required:** Yes

### metadata

- **Type:** Data
- **Required:** No

## Outputs

### stepData

- **Type:** Data

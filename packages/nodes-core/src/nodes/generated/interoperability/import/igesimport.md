# IGESImport Node

**Category:** Interoperability / Import

Import IGES (.igs) CAD files

## Parameters

### Units

- **Type:** enum
- **Default:** "auto"

### Read Failed

- **Type:** boolean
- **Default:** false

- **Description:** Read failed entities

### One Object

- **Type:** boolean
- **Default:** false

- **Description:** Merge into one shape

## Inputs

### File Path

- **Type:** string
- **Required:** Yes

## Outputs

### Shapes

- **Type:** Shape[]

### Curves

- **Type:** Wire[]

### Surfaces

- **Type:** Face[]

### Metadata

- **Type:** Properties

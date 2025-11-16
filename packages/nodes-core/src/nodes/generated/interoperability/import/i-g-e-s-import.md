# IGESImport Node

**Category:** Interoperability / Import

Import IGES (.igs) CAD files

## Parameters

### units

- **Type:** enum
- **Default:** "auto"

### readFailed

- **Type:** boolean
- **Default:** false

- **Description:** Read failed entities

### oneObject

- **Type:** boolean
- **Default:** false

- **Description:** Merge into one shape

## Inputs

### filePath

- **Type:** string
- **Required:** Yes

## Outputs

### shapes

- **Type:** Shape[]

### curves

- **Type:** Wire[]

### surfaces

- **Type:** Face[]

### metadata

- **Type:** Properties

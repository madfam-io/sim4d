# WeldingPath Node

**Category:** Fabrication / Robotics

Robotic welding path

## Parameters

### Weld Type

- **Type:** enum
- **Default:** "mig"

### Weave Pattern

- **Type:** enum
- **Default:** "none"

### Travel Speed

- **Type:** number
- **Default:** 10
- **Min:** 1
- **Max:** 50

## Inputs

### Seam Path

- **Type:** Wire
- **Required:** Yes

## Outputs

### Weld Path

- **Type:** Transform[]

### Weld Parameters

- **Type:** Data

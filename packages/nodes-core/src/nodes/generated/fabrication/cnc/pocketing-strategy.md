# PocketingStrategy Node

**Category:** Fabrication / CNC

Pocket machining strategy

## Parameters

### Pattern

- **Type:** enum
- **Default:** "spiral"

### Stepdown

- **Type:** number
- **Default:** 2
- **Min:** 0.1
- **Max:** 10

### Finish Pass

- **Type:** boolean
- **Default:** true

## Inputs

### Pocket

- **Type:** Wire
- **Required:** Yes

### Depth

- **Type:** Number
- **Required:** Yes

## Outputs

### Roughing

- **Type:** Wire[]

### Finishing

- **Type:** Wire[]

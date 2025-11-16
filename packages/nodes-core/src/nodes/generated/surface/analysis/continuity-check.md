# ContinuityCheck Node

**Category:** Surface / Analysis

Check surface continuity

## Parameters

### Check Type

- **Type:** enum
- **Default:** "G1"

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.0001
- **Max:** 1

## Inputs

### Surface1

- **Type:** Face
- **Required:** Yes

### Surface2

- **Type:** Face
- **Required:** Yes

### Edge

- **Type:** Edge
- **Required:** No

## Outputs

### Is Continuous

- **Type:** boolean

### Deviations

- **Type:** Data

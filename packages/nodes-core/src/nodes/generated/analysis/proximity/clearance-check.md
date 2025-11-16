# ClearanceCheck Node

**Category:** Analysis / Proximity

Check clearance requirements

## Parameters

### Required Clearance

- **Type:** number
- **Default:** 5
- **Min:** 0.1
- **Max:** 100

### Highlight Violations

- **Type:** boolean
- **Default:** true

## Inputs

### Moving Object

- **Type:** Shape
- **Required:** Yes

### Obstacles

- **Type:** Shape[]
- **Required:** Yes

## Outputs

### Has Violations

- **Type:** boolean

### Violation Points

- **Type:** Point[]

### Clearance Values

- **Type:** number[]

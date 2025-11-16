# Clearance Node

**Category:** Analysis / Collision

Check clearance between shapes

## Parameters

### minClearance

- **Type:** number
- **Default:** 1
- **Min:** 0
- **Max:** 10000

## Inputs

### shape1

- **Type:** Shape
- **Required:** Yes

### shape2

- **Type:** Shape
- **Required:** Yes

## Outputs

### hasClearance

- **Type:** boolean
- **Description:** Clearance status

### actualClearance

- **Type:** number
- **Description:** Actual clearance distance

### violationPoints

- **Type:** Point[]
- **Description:** Points violating clearance

# AirBearing Node

**Category:** MechanicalEngineering / Bearings

Create air bearing design

## Parameters

### Diameter

- **Type:** number
- **Default:** 50
- **Min:** 20
- **Max:** 200

### Thickness

- **Type:** number
- **Default:** 10
- **Min:** 5
- **Max:** 30

### Pocket Count

- **Type:** number
- **Default:** 6
- **Min:** 3
- **Max:** 12

### Restrictor Type

- **Type:** enum
- **Default:** "orifice"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Bearing

- **Type:** Shape

### Pockets

- **Type:** Face[]

### Restrictors

- **Type:** Wire[]

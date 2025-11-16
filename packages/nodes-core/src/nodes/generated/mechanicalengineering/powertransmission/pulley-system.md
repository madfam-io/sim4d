# PulleySystem Node

**Category:** MechanicalEngineering / PowerTransmission

Create pulley system

## Parameters

### driveDiameter

- **Type:** number
- **Default:** 100
- **Min:** 20
- **Max:** 500

### drivenDiameter

- **Type:** number
- **Default:** 200
- **Min:** 20
- **Max:** 500

### beltWidth

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 100

### centerDistance

- **Type:** number
- **Default:** 300
- **Min:** 100
- **Max:** 1000

## Inputs

### driveCenter

- **Type:** Point
- **Required:** Yes

### drivenCenter

- **Type:** Point
- **Required:** Yes

## Outputs

### system

- **Type:** Shape

### pulleys

- **Type:** Shape[]

### belt

- **Type:** Shape

# ChainDrive Node

**Category:** MechanicalEngineering / PowerTransmission

Create chain drive system

## Parameters

### driveTeeth

- **Type:** number
- **Default:** 17
- **Min:** 9
- **Max:** 50

### drivenTeeth

- **Type:** number
- **Default:** 42
- **Min:** 15
- **Max:** 120

### chainPitch

- **Type:** number
- **Default:** 12.7
- **Min:** 6
- **Max:** 25.4

### chainRows

- **Type:** number
- **Default:** 1
- **Min:** 1
- **Max:** 3

## Inputs

### sprocket1Center

- **Type:** Point
- **Required:** Yes

### sprocket2Center

- **Type:** Point
- **Required:** Yes

## Outputs

### system

- **Type:** Shape

### sprockets

- **Type:** Shape[]

### chain

- **Type:** Shape

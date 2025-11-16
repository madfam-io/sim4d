# ChainDrive Node

**Category:** MechanicalEngineering / PowerTransmission

Create chain drive system

## Parameters

### Drive Teeth

- **Type:** number
- **Default:** 17
- **Min:** 9
- **Max:** 50

### Driven Teeth

- **Type:** number
- **Default:** 42
- **Min:** 15
- **Max:** 120

### Chain Pitch

- **Type:** number
- **Default:** 12.7
- **Min:** 6
- **Max:** 25.4

### Chain Rows

- **Type:** number
- **Default:** 1
- **Min:** 1
- **Max:** 3

## Inputs

### Sprocket1 Center

- **Type:** Point
- **Required:** Yes

### Sprocket2 Center

- **Type:** Point
- **Required:** Yes

## Outputs

### System

- **Type:** Shape

### Sprockets

- **Type:** Shape[]

### Chain

- **Type:** Shape

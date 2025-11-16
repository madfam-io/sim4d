# PulleySystem Node

**Category:** MechanicalEngineering / PowerTransmission

Create pulley system

## Parameters

### Drive Diameter

- **Type:** number
- **Default:** 100
- **Min:** 20
- **Max:** 500

### Driven Diameter

- **Type:** number
- **Default:** 200
- **Min:** 20
- **Max:** 500

### Belt Width

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 100

### Center Distance

- **Type:** number
- **Default:** 300
- **Min:** 100
- **Max:** 1000

## Inputs

### Drive Center

- **Type:** Point
- **Required:** Yes

### Driven Center

- **Type:** Point
- **Required:** Yes

## Outputs

### System

- **Type:** Shape

### Pulleys

- **Type:** Shape[]

### Belt

- **Type:** Shape

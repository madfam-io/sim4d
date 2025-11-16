# PlanetaryGearSet Node

**Category:** MechanicalEngineering / Gears

Create planetary gear system

## Parameters

### Sun Teeth

- **Type:** number
- **Default:** 20
- **Min:** 12
- **Max:** 40

### Planet Teeth

- **Type:** number
- **Default:** 16
- **Min:** 8
- **Max:** 30

### Planet Count

- **Type:** number
- **Default:** 3
- **Min:** 2
- **Max:** 6

### Module

- **Type:** number
- **Default:** 2
- **Min:** 0.5
- **Max:** 5

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Assembly

- **Type:** Shape

### Sun Gear

- **Type:** Shape

### Planet Gears

- **Type:** Shape[]

### Ring Gear

- **Type:** Shape

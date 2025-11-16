# SpurGear Node

**Category:** MechanicalEngineering / Gears

Create standard spur gear

## Parameters

### Module

- **Type:** number
- **Default:** 2
- **Min:** 0.5
- **Max:** 20
- **Description:** Gear module in mm

### Teeth

- **Type:** number
- **Default:** 20
- **Min:** 6
- **Max:** 200
- **Description:** Number of teeth

### Pressure Angle

- **Type:** number
- **Default:** 20
- **Min:** 14.5
- **Max:** 25
- **Description:** Pressure angle in degrees

### Width

- **Type:** number
- **Default:** 20
- **Min:** 1
- **Max:** 200
- **Description:** Face width in mm

### Hub Diameter

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 100
- **Description:** Hub bore diameter

## Inputs

### Center

- **Type:** Point
- **Required:** No

### Axis

- **Type:** Vector
- **Required:** No

## Outputs

### Gear

- **Type:** Shape

### Pitch Circle

- **Type:** Wire

### Properties

- **Type:** Properties

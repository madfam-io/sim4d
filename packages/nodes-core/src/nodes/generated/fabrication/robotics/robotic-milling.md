# RoboticMilling Node

**Category:** Fabrication / Robotics

Robotic milling paths

## Parameters

### Spindle Speed

- **Type:** number
- **Default:** 10000
- **Min:** 1000
- **Max:** 30000

### Feed Rate

- **Type:** number
- **Default:** 1000
- **Min:** 10
- **Max:** 5000

## Inputs

### Milling Paths

- **Type:** Wire[]
- **Required:** Yes

### Tool Orientation

- **Type:** Vector
- **Required:** No

## Outputs

### Robot Program

- **Type:** Data

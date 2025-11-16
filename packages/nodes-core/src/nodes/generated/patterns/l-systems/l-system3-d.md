# LSystem3D Node

**Category:** Patterns / L-Systems

3D L-system generator

## Parameters

### axiom

- **Type:** string
- **Default:** "F"

### rules

- **Type:** string
- **Default:** "F=F[+F]F[-F]F"

### angle

- **Type:** number
- **Default:** 25
- **Min:** 0
- **Max:** 360

### iterations

- **Type:** number
- **Default:** 4
- **Min:** 1
- **Max:** 8

## Inputs

### startPoint

- **Type:** Point
- **Required:** Yes

## Outputs

### branches

- **Type:** Wire[]

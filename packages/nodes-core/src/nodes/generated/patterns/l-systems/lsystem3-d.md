# LSystem3D Node

**Category:** Patterns / L-Systems

3D L-system generator

## Parameters

### Axiom

- **Type:** string
- **Default:** "F"

### Rules

- **Type:** string
- **Default:** "F=F[+F]F[-F]F"

### Angle

- **Type:** number
- **Default:** 25
- **Min:** 0
- **Max:** 360

### Iterations

- **Type:** number
- **Default:** 4
- **Min:** 1
- **Max:** 8

## Inputs

### Start Point

- **Type:** Point
- **Required:** Yes

## Outputs

### Branches

- **Type:** Wire[]

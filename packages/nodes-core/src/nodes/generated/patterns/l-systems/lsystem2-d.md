# LSystem2D Node

**Category:** Patterns / L-Systems

2D L-system generator

## Parameters

### Axiom

- **Type:** string
- **Default:** "F"

### Rules

- **Type:** string
- **Default:** "F=F+F-F-F+F"

### Angle

- **Type:** number
- **Default:** 90
- **Min:** 0
- **Max:** 360

### Iterations

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 8

## Inputs

### Start Point

- **Type:** Point
- **Required:** Yes

## Outputs

### Pattern

- **Type:** Wire

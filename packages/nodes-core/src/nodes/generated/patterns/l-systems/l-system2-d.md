# LSystem2D Node

**Category:** Patterns / L-Systems

2D L-system generator

## Parameters

### axiom

- **Type:** string
- **Default:** "F"

### rules

- **Type:** string
- **Default:** "F=F+F-F-F+F"

### angle

- **Type:** number
- **Default:** 90
- **Min:** 0
- **Max:** 360

### iterations

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 8

## Inputs

### startPoint

- **Type:** Point
- **Required:** Yes

## Outputs

### pattern

- **Type:** Wire

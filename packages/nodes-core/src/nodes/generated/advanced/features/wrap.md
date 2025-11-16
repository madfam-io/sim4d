# Wrap Node

**Category:** Advanced / Features

Wrap geometry onto surface

## Parameters

### Wrap Type

- **Type:** enum
- **Default:** "emboss"

### Depth

- **Type:** number
- **Default:** 1
- **Min:** 0.01
- **Max:** 100

## Inputs

### Target Surface

- **Type:** Face
- **Required:** Yes

### Sketch

- **Type:** Wire
- **Required:** Yes

### Projection Direction

- **Type:** Vector
- **Required:** No

## Outputs

### Wrapped Shape

- **Type:** Shape

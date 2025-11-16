# BlendCurve Node

**Category:** Surface / Curves

Blend between two curves

## Parameters

### Continuity Start

- **Type:** enum
- **Default:** "G1"

### Continuity End

- **Type:** enum
- **Default:** "G1"

### Bulge

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

## Inputs

### Curve1

- **Type:** Wire
- **Required:** Yes

### Curve2

- **Type:** Wire
- **Required:** Yes

### Point1

- **Type:** Point
- **Required:** No

### Point2

- **Type:** Point
- **Required:** No

## Outputs

### Blend Curve

- **Type:** Wire

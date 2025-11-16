# Fillet2D Node

**Category:** Sketch / Curves

Fillet corners of a 2D shape

## Parameters

### Radius

- **Type:** number
- **Default:** 5
- **Min:** 0.1
- **Max:** 1000

### All Corners

- **Type:** boolean
- **Default:** true

## Inputs

### Wire

- **Type:** Wire
- **Required:** Yes
- **Description:** Wire to fillet

### Vertices

- **Type:** Vertex[]
- **Required:** No
- **Description:** Specific vertices to fillet

## Outputs

### Filleted

- **Type:** Wire
- **Description:** Filleted wire

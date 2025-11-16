# Tessellate Node

**Category:** Mesh / Tessellation

Convert shape to mesh

## Parameters

### Linear Deflection

- **Type:** number
- **Default:** 0.1
- **Min:** 0.001
- **Max:** 10
- **Description:** Maximum deviation from true surface

### Angular Deflection

- **Type:** number
- **Default:** 0.5
- **Min:** 0.01
- **Max:** 1
- **Description:** Angular deflection in radians

### Relative

- **Type:** boolean
- **Default:** false

- **Description:** Use relative deflection

### Quality Normals

- **Type:** boolean
- **Default:** true

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

## Outputs

### Mesh

- **Type:** Mesh

### Triangle Count

- **Type:** number

### Vertex Count

- **Type:** number

# TreeGenerator Node

**Category:** Patterns / L-Systems

Parametric tree generator

## Parameters

### Tree Type

- **Type:** enum
- **Default:** "oak"

### Height

- **Type:** number
- **Default:** 100
- **Min:** 10

### Branches

- **Type:** number
- **Default:** 5
- **Min:** 2
- **Max:** 10

### Seed

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 999999

## Inputs

### Base

- **Type:** Point
- **Required:** Yes

## Outputs

### Trunk

- **Type:** Wire[]

### Leaves

- **Type:** Point[]

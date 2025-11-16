# CurveSmoothnessAnalysis Node

**Category:** Analysis / Curves

Analyze curve continuity and smoothness

## Parameters

### Continuity Level

- **Type:** enum
- **Default:** "G2"

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Show Breaks

- **Type:** boolean
- **Default:** true

## Inputs

### Curve

- **Type:** Wire
- **Required:** Yes

## Outputs

### Is Smooth

- **Type:** boolean

### Break Points

- **Type:** Point[]

### Continuity Report

- **Type:** Properties

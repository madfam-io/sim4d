# SQLInsert Node

**Category:** Interoperability / Database

Insert data into SQL database

## Parameters

### connectionString

- **Type:** string
- **Default:** ""

### tableName

- **Type:** string
- **Default:** ""

- **Description:** Target table name

### batchSize

- **Type:** number
- **Default:** 100
- **Min:** 1
- **Max:** 1000

## Inputs

### data

- **Type:** Properties[]
- **Required:** Yes

## Outputs

### success

- **Type:** boolean

### insertedRows

- **Type:** number

### errors

- **Type:** string[]

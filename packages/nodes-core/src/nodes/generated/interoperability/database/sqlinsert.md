# SQLInsert Node

**Category:** Interoperability / Database

Insert data into SQL database

## Parameters

### Connection String

- **Type:** string
- **Default:** ""

### Table Name

- **Type:** string
- **Default:** ""

- **Description:** Target table name

### Batch Size

- **Type:** number
- **Default:** 100
- **Min:** 1
- **Max:** 1000

## Inputs

### Data

- **Type:** Properties[]
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### Inserted Rows

- **Type:** number

### Errors

- **Type:** string[]

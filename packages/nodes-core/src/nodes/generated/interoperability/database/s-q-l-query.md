# SQLQuery Node

**Category:** Interoperability / Database

Execute SQL database queries

## Parameters

### connectionString

- **Type:** string
- **Default:** ""

- **Description:** Database connection string

### query

- **Type:** string
- **Default:** "SELECT \* FROM table"

- **Description:** SQL query

### timeout

- **Type:** number
- **Default:** 30
- **Min:** 1
- **Max:** 300
- **Description:** Timeout in seconds

## Inputs

### parameters

- **Type:** Properties
- **Required:** No

## Outputs

### data

- **Type:** Properties[]

### rowCount

- **Type:** number

### columns

- **Type:** string[]

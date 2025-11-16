# SQLQuery Node

**Category:** Interoperability / Database

Execute SQL database queries

## Parameters

### Connection String

- **Type:** string
- **Default:** ""

- **Description:** Database connection string

### Query

- **Type:** string
- **Default:** "SELECT \* FROM table"

- **Description:** SQL query

### Timeout

- **Type:** number
- **Default:** 30
- **Min:** 1
- **Max:** 300
- **Description:** Timeout in seconds

## Inputs

### Parameters

- **Type:** Properties
- **Required:** No

## Outputs

### Data

- **Type:** Properties[]

### Row Count

- **Type:** number

### Columns

- **Type:** string[]

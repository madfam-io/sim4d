# HTTPRequest Node

**Category:** Interoperability / API

Make HTTP REST API requests

## Parameters

### Method

- **Type:** enum
- **Default:** "GET"

### Url

- **Type:** string
- **Default:** ""

- **Description:** API endpoint URL

### Timeout

- **Type:** number
- **Default:** 30
- **Min:** 1
- **Max:** 300

### Retries

- **Type:** number
- **Default:** 3
- **Min:** 0
- **Max:** 10

## Inputs

### Headers

- **Type:** Properties
- **Required:** No

### Body

- **Type:** Properties
- **Required:** No

## Outputs

### Response

- **Type:** Properties

### Status Code

- **Type:** number

### Headers

- **Type:** Properties

# HTTPRequest Node

**Category:** Interoperability / API

Make HTTP REST API requests

## Parameters

### method

- **Type:** enum
- **Default:** "GET"

### url

- **Type:** string
- **Default:** ""

- **Description:** API endpoint URL

### timeout

- **Type:** number
- **Default:** 30
- **Min:** 1
- **Max:** 300

### retries

- **Type:** number
- **Default:** 3
- **Min:** 0
- **Max:** 10

## Inputs

### headers

- **Type:** Properties
- **Required:** No

### body

- **Type:** Properties
- **Required:** No

## Outputs

### response

- **Type:** Properties

### statusCode

- **Type:** number

### headers

- **Type:** Properties

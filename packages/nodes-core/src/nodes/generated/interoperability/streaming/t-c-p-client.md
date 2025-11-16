# TCPClient Node

**Category:** Interoperability / Streaming

TCP socket client connection

## Parameters

### host

- **Type:** string
- **Default:** "localhost"

### port

- **Type:** number
- **Default:** 8080
- **Min:** 1
- **Max:** 65535

### timeout

- **Type:** number
- **Default:** 30
- **Min:** 1
- **Max:** 300

## Inputs

### data

- **Type:** string
- **Required:** No

## Outputs

### connected

- **Type:** boolean

### response

- **Type:** string

### error

- **Type:** string

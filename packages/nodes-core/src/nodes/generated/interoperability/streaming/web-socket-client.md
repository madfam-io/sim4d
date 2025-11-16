# WebSocketClient Node

**Category:** Interoperability / Streaming

Connect to WebSocket data streams

## Parameters

### Url

- **Type:** string
- **Default:** ""

- **Description:** WebSocket server URL

### Reconnect

- **Type:** boolean
- **Default:** true

### Heartbeat

- **Type:** number
- **Default:** 30
- **Min:** 0
- **Max:** 300
- **Description:** Heartbeat interval

## Inputs

### Message

- **Type:** string
- **Required:** No

## Outputs

### Connected

- **Type:** boolean

### Messages

- **Type:** string[]

### Last Message

- **Type:** string

# MQTTPublisher Node

**Category:** Interoperability / Streaming

Publish MQTT messages

## Parameters

### Broker

- **Type:** string
- **Default:** ""

- **Description:** MQTT broker address

### Port

- **Type:** number
- **Default:** 1883
- **Min:** 1
- **Max:** 65535

### Topic

- **Type:** string
- **Default:** ""

### Qos

- **Type:** enum
- **Default:** "0"

## Inputs

### Payload

- **Type:** string
- **Required:** Yes

## Outputs

### Published

- **Type:** boolean

### Message Id

- **Type:** string

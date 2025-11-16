# MQTTPublisher Node

**Category:** Interoperability / Streaming

Publish MQTT messages

## Parameters

### broker

- **Type:** string
- **Default:** ""

- **Description:** MQTT broker address

### port

- **Type:** number
- **Default:** 1883
- **Min:** 1
- **Max:** 65535

### topic

- **Type:** string
- **Default:** ""

### qos

- **Type:** enum
- **Default:** "0"

## Inputs

### payload

- **Type:** string
- **Required:** Yes

## Outputs

### published

- **Type:** boolean

### messageId

- **Type:** string

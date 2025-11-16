# MQTTSubscriber Node

**Category:** Interoperability / Streaming

Subscribe to MQTT topics

## Parameters

### Broker

- **Type:** string
- **Default:** ""

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

This node has no inputs.

## Outputs

### Connected

- **Type:** boolean

### Messages

- **Type:** string[]

### Last Message

- **Type:** string

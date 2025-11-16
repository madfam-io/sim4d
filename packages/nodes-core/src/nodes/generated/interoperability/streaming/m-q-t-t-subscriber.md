# MQTTSubscriber Node

**Category:** Interoperability / Streaming

Subscribe to MQTT topics

## Parameters

### broker

- **Type:** string
- **Default:** ""

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

This node has no inputs.

## Outputs

### connected

- **Type:** boolean

### messages

- **Type:** string[]

### lastMessage

- **Type:** string

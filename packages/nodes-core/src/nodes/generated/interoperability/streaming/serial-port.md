# SerialPort Node

**Category:** Interoperability / Streaming

Communicate with serial devices

## Parameters

### Port

- **Type:** string
- **Default:** "COM1"

- **Description:** Serial port name

### Baud Rate

- **Type:** enum
- **Default:** "9600"

### Data Bits

- **Type:** enum
- **Default:** "8"

### Parity

- **Type:** enum
- **Default:** "none"

## Inputs

### Data

- **Type:** string
- **Required:** No

## Outputs

### Connected

- **Type:** boolean

### Received

- **Type:** string

### Buffer

- **Type:** string[]

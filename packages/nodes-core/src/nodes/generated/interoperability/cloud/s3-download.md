# S3Download Node

**Category:** Interoperability / Cloud

Download files from AWS S3

## Parameters

### Bucket

- **Type:** string
- **Default:** ""

### Access Key

- **Type:** string
- **Default:** ""

### Secret Key

- **Type:** string
- **Default:** ""

### Region

- **Type:** string
- **Default:** "us-east-1"

## Inputs

### Key

- **Type:** string
- **Required:** Yes

### Local Path

- **Type:** string
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### File Size

- **Type:** number

### Metadata

- **Type:** Properties

# S3Upload Node

**Category:** Interoperability / Cloud

Upload files to AWS S3

## Parameters

### Bucket

- **Type:** string
- **Default:** ""

- **Description:** S3 bucket name

### Access Key

- **Type:** string
- **Default:** ""

- **Description:** AWS access key

### Secret Key

- **Type:** string
- **Default:** ""

- **Description:** AWS secret key

### Region

- **Type:** string
- **Default:** "us-east-1"

## Inputs

### File Path

- **Type:** string
- **Required:** Yes

### Key

- **Type:** string
- **Required:** Yes

## Outputs

### Success

- **Type:** boolean

### Url

- **Type:** string

### Etag

- **Type:** string

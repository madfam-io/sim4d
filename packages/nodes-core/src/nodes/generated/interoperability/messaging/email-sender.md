# EmailSender Node

**Category:** Interoperability / Messaging

Send email notifications

## Parameters

### Smtp Server

- **Type:** string
- **Default:** ""

- **Description:** SMTP server address

### Port

- **Type:** number
- **Default:** 587
- **Min:** 1
- **Max:** 65535

### Username

- **Type:** string
- **Default:** ""

### Password

- **Type:** string
- **Default:** ""

## Inputs

### To

- **Type:** string
- **Required:** Yes

### Subject

- **Type:** string
- **Required:** Yes

### Body

- **Type:** string
- **Required:** Yes

### Attachments

- **Type:** string[]
- **Required:** No

## Outputs

### Sent

- **Type:** boolean

### Message Id

- **Type:** string

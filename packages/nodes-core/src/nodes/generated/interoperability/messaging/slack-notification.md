# SlackNotification Node

**Category:** Interoperability / Messaging

Send Slack notifications

## Parameters

### Webhook Url

- **Type:** string
- **Default:** ""

- **Description:** Slack webhook URL

### Channel

- **Type:** string
- **Default:** "#general"

### Username

- **Type:** string
- **Default:** "BrepFlow"

## Inputs

### Message

- **Type:** string
- **Required:** Yes

### Attachments

- **Type:** Properties[]
- **Required:** No

## Outputs

### Sent

- **Type:** boolean

### Timestamp

- **Type:** string

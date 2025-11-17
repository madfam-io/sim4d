# Slack Notifications Setup Guide

Optional integration for real-time CI/CD failure notifications in Slack.

## Overview

The Slack notifications workflow automatically posts messages to your Slack channel when:

- **Failures**: Any workflow fails (Docker Testing, PR Quality Gate, CI)
- **Success on main**: Docker Testing succeeds on main branch (optional)

## Setup Instructions

### 1. Create Slack Incoming Webhook

1. Go to your Slack workspace
2. Navigate to **Apps** → **Add apps**
3. Search for "Incoming Webhooks"
4. Click **Add to Slack**
5. Select the channel for notifications (e.g., `#ci-cd-alerts`)
6. Click **Add Incoming WebHooks Integration**
7. **Copy the Webhook URL** (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

### 2. Add Webhook to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Paste the webhook URL from step 1
6. Click **Add secret**

### 3. Enable the Workflow

The workflow is already configured in `.github/workflows/slack-notifications.yml`.

It will automatically start working once the `SLACK_WEBHOOK_URL` secret is set.

## Notification Examples

### Failure Notification

```
❌ CI/CD Failure Alert

Workflow: Docker Testing
Status: failure
Branch: feat/new-feature
Commit: abc1234

Repository: aureo-labs/brepflow

[View Workflow Run] (button)
```

### Success Notification (main branch only)

```
✅ Docker Testing passed on `main` branch
View workflow run
```

## Configuration

### Customize Notifications

Edit `.github/workflows/slack-notifications.yml` to customize:

**1. Which workflows trigger notifications:**

```yaml
on:
  workflow_run:
    workflows: ['Docker Testing', 'PR Quality Gate', 'CI'] # Add/remove workflows
    types: [completed]
```

**2. When to send notifications:**

```yaml
# Current: Only on failures
if: ${{ github.event.workflow_run.conclusion != 'success' }}

# Alternative: All runs
if: ${{ always() }}
```

**3. Message format:**

```yaml
payload: |
  {
    "blocks": [
      # Customize Slack Block Kit JSON here
    ]
  }
```

### Advanced Options

**Send to different channels based on workflow:**

```yaml
- name: Determine Slack channel
  id: channel
  run: |
    if [ "${{ github.event.workflow_run.name }}" == "Docker Testing" ]; then
      echo "webhook=${{ secrets.SLACK_WEBHOOK_DOCKER }}" >> $GITHUB_OUTPUT
    else
      echo "webhook=${{ secrets.SLACK_WEBHOOK_CI }}" >> $GITHUB_OUTPUT
    fi

- name: Send notification
  uses: slackapi/slack-github-action@v1.25.0
  with:
    payload: |
      ...
  env:
    SLACK_WEBHOOK_URL: ${{ steps.channel.outputs.webhook }}
```

**Include test results in notification:**

```yaml
- name: Get test results
  run: |
    gh run view ${{ github.event.workflow_run.id }} --json jobs \
      | jq '.jobs[] | select(.name == "docker-unit-tests") | .conclusion'
```

## Testing

### Test the Integration

1. **Trigger a workflow manually:**

   ```bash
   gh workflow run test-docker.yml
   ```

2. **Check Slack channel** for notification

3. **If not working**, check:
   - Webhook URL is correct
   - Webhook is active in Slack
   - GitHub secret is properly set
   - Workflow has permissions to read secrets

### Debug Mode

Add debug output to workflow:

```yaml
- name: Debug webhook
  run: |
    echo "Webhook configured: ${{ secrets.SLACK_WEBHOOK_URL != '' }}"
    echo "Workflow: ${{ github.event.workflow_run.name }}"
    echo "Conclusion: ${{ github.event.workflow_run.conclusion }}"
```

## Disabling Notifications

### Temporarily Disable

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Delete or rename `SLACK_WEBHOOK_URL` secret

### Permanently Disable

Delete the workflow file:

```bash
rm .github/workflows/slack-notifications.yml
```

## Troubleshooting

### Notifications Not Received

**Check 1: Secret is set**

```bash
gh secret list | grep SLACK_WEBHOOK_URL
```

**Check 2: Workflow is enabled**

```bash
gh workflow view slack-notifications.yml
```

**Check 3: Slack webhook is valid**

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_WEBHOOK_URL
```

### Too Many Notifications

**Filter by branch:**

```yaml
if: |
  github.event.workflow_run.conclusion != 'success' &&
  (github.event.workflow_run.head_branch == 'main' || 
   github.event.workflow_run.head_branch == 'develop')
```

**Rate limiting:**
Consider using Slack's threading feature or digest notifications for high-volume repos.

## Security

- ✅ **Webhook URL is secret**: Never commit webhook URL to repository
- ✅ **GitHub Secrets are encrypted**: Secrets are encrypted at rest and in transit
- ✅ **Minimal permissions**: Workflow only has read access to workflow runs
- ⚠️ **Webhook URL grants posting access**: Anyone with the URL can post to your channel

**Best Practice**: Regularly rotate webhook URLs in Slack and update GitHub secrets.

## Alternative: Slack App

For more advanced features, consider using a Slack App instead of webhooks:

1. **Better security**: OAuth tokens with fine-grained permissions
2. **Rich interactions**: Buttons, dropdowns, dialog modals
3. **User mapping**: Map GitHub users to Slack users for mentions
4. **Bidirectional**: Slack commands can trigger GitHub Actions

See: https://github.com/integrations/slack

## References

- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [GitHub Actions Slack Action](https://github.com/slackapi/slack-github-action)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Last Updated**: 2025-11-17  
**Status**: Optional Feature

# Privacy Policy

_Last updated: January 2025_

## Overview

Twitch Clip Todo is committed to protecting your privacy. This policy explains what data we collect and how we use it.

## Single Purpose

Twitch Clip Todo has one clear purpose: **bookmarking moments during Twitch streams to create clips later**.

All features support this core functionality:

- One-click timestamp recording during live streams and VODs
- Record management with memos and streamer grouping
- Automatic VOD linking for live stream recordings
- One-click navigation to Twitch's clip creator

This extension does not bundle unrelated features or functionalities.

## Data Collection

**Twitch Clip Todo does not collect, transmit, or store any personal data on external servers.**

All data is stored locally on your device using Chrome's built-in storage APIs (`chrome.storage.local`).

## Data Stored Locally

Twitch Clip Todo stores the following data locally on your device:

### Record Data

- **Timestamps**: The moment (in seconds) you bookmarked during a stream or VOD
- **Memos**: Optional notes you add to describe the moment
- **Streamer names**: The name of the streamer whose content you are watching
- **VOD IDs**: Identifiers used to link live stream recordings to archived VODs
- **Creation timestamps**: When each record was created

### Optional Twitch Data

If you connect your Twitch account for enhanced features:

- Cached streamer information (display names, profile images)
- Cached VOD metadata (titles, durations)
- Authentication tokens (stored in Chrome's local storage)

### User Settings

- Widget position preferences
- Extension behavior settings

## Data We Do NOT Collect

- Personal identification information (name, email, address)
- Browsing history outside of Twitch
- Analytics or usage statistics
- Advertising identifiers
- Location data
- Any data from non-Twitch websites

## Data Retention

- Records are automatically cleaned up after **60 days** via scheduled alarms
- You can manually delete individual records or all data at any time
- Cached Twitch data is refreshed periodically and removed when no longer needed

## Permissions Used

Twitch Clip Todo requires the following Chrome permissions:

| Permission  | Purpose                                                                              |
| ----------- | ------------------------------------------------------------------------------------ |
| `tabs`      | Read the current Twitch page URL and title to identify the streamer and content type |
| `storage`   | Store bookmark records, user settings, and cached data locally on your device        |
| `activeTab` | Interact with the Twitch player on the current tab to capture accurate timestamps    |
| `alarms`    | Schedule automatic cleanup of records older than 60 days                             |

## Third-Party Services

### Twitch API (Optional)

When you choose to connect your Twitch account, Twitch Clip Todo communicates with the Twitch API to:

- Retrieve VOD information for linking live stream recordings
- Fetch streamer profile information for display

This communication only occurs when you explicitly use features that require it. No data is sent to any server other than Twitch's official API, and only standard Twitch API requests are made.

### No Analytics or Tracking

Twitch Clip Todo does not use any third-party analytics, tracking, or advertising services.

## Data Sharing

We do not share any data with third parties. All data remains on your device.

## Data Deletion

To delete all Twitch Clip Todo data:

1. Right-click the extension icon
2. Select "Remove from Chrome"

This will remove all locally stored data including records, settings, and cached Twitch data.

You can also clear extension data in Chrome settings, or delete individual records through the extension's side panel.

## Your Responsibilities

While Twitch Clip Todo stores all data locally and does not transmit it externally, you are responsible for:

- Securing your device from unauthorized access
- Managing who has access to your browser profile
- Understanding that locally stored data is accessible to anyone with device access

See our [Terms of Service](/en/terms) for complete details.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.

## Related Documents

- [Terms of Service](/en/terms)
- [License](/en/license)

## Contact

If you have questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/whatasoda/twitch-clip-todo).

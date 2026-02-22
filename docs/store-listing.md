# Chrome Web Store Listing Reference

Internal reference document for Chrome Web Store submission.

## Single Purpose Description

**English:**
Bookmark moments during Twitch streams to create clips later.

**日本語:**
Twitch 配信中の気になる瞬間をブックマークして、後でクリップを作成します。

## Permission Justifications

These descriptions are used for the Chrome Web Store "Permission Justification" fields during review.

### `tabs`

**English:**
Required to read the current Twitch page URL and title, which allows the extension to identify the streamer name, detect whether the user is watching a live stream or VOD, and extract the video ID for bookmark linking.

**日本語:**
現在の Twitch ページの URL とタイトルを読み取るために必要です。これにより、配信者名の識別、ライブ配信か VOD かの検出、ブックマークリンク用のビデオ ID の抽出が可能になります。

### `storage`

**English:**
Required to store bookmark records (timestamps, memos, streamer names, VOD IDs), user settings (widget position, preferences), and cached Twitch metadata locally on the user's device. No data is transmitted externally.

**日本語:**
ブックマーク記録（タイムスタンプ、メモ、配信者名、VOD ID）、ユーザー設定（ウィジェット位置、設定値）、およびキャッシュされた Twitch メタデータをユーザーのデバイスにローカル保存するために必要です。データは外部に送信されません。

### `activeTab`

**English:**
Required to interact with the Twitch video player on the currently active tab to read the current playback position (timestamp) when the user creates a bookmark. This permission is only used on twitch.tv pages.

**日本語:**
ユーザーがブックマークを作成する際に、現在アクティブなタブの Twitch 動画プレーヤーと連携して現在の再生位置（タイムスタンプ）を取得するために必要です。この権限は twitch.tv のページでのみ使用されます。

### `alarms`

**English:**
Required to schedule automatic cleanup of bookmark records older than 60 days. This runs periodically in the background to manage storage usage without requiring user intervention.

**日本語:**
60日以上経過したブックマーク記録の自動クリーンアップをスケジュールするために必要です。ユーザーの操作なしにストレージ使用量を管理するため、バックグラウンドで定期的に実行されます。

### Host permission: `https://www.twitch.tv/*`, `https://twitch.tv/*`

**English:**
Required to inject a content script on twitch.tv pages. The content script detects the currently viewed stream or VOD, displays a floating action button for bookmarking moments, and reads page metadata (streamer name, stream title, playback timestamp). This is the core functionality of the extension and it cannot operate without access to twitch.tv. No data is collected from or sent to any third-party server; all bookmarked data is stored locally via chrome.storage.

**日本語:**
twitch.tv のページにコンテンツスクリプトを挿入するために必要です。コンテンツスクリプトは、現在視聴中の配信または VOD を検出し、瞬間をブックマークするためのフローティングアクションボタンを表示し、ページのメタデータ（配信者名、配信タイトル、再生タイムスタンプ）を読み取ります。これは拡張機能の中核機能であり、twitch.tv へのアクセスなしでは動作できません。データはサードパーティのサーバーに収集・送信されず、すべてのブックマークデータは chrome.storage を通じてローカルに保存されます。

## Store Description

### Short Description (132 characters max)

**English:**
Bookmark moments during Twitch streams to create clips later. One-click recording, auto VOD linking, no login required.

**日本語:**
Twitch 配信中の気になる瞬間をブックマーク。ワンクリック記録、自動 VOD リンク、ログイン不要。

### Detailed Description

**English:**
Never miss a clip-worthy moment on Twitch again.

Twitch Clip Todo lets you bookmark moments during live streams and VODs with a single click or keyboard shortcut (Alt+Shift+C). Add optional memos to remember why each moment stood out, then come back later to create clips at your own pace.

Key Features:
• One-click timestamp recording via keyboard shortcut or floating widget
• Optional memos to describe each bookmarked moment
• Automatic VOD linking — live stream bookmarks are linked to VODs after the stream ends
• Records grouped by streamer in a convenient side panel
• One-click navigation to Twitch's clip creator at the exact timestamp
• Track which clips you've already created
• 60-day automatic cleanup keeps your data manageable

Privacy First:
• All data stored locally on your device
• No analytics, tracking, or external data collection

**日本語:**
Twitch でクリップにしたい瞬間をもう見逃しません。

Twitch Clip Todo は、ライブ配信や VOD の視聴中にワンクリックまたはキーボードショートカット（Alt+Shift+C）で瞬間をブックマークできる拡張機能です。オプションのメモを追加して、なぜその瞬間が気になったかを記録し、後で自分のペースでクリップを作成できます。

主な機能：
• キーボードショートカットまたはフローティングウィジェットによるワンクリックタイムスタンプ記録
• ブックマークした瞬間を説明するオプションのメモ
• 自動 VOD リンク — 配信終了後にライブ配信のブックマークを VOD にリンク
• サイドパネルで配信者ごとにグループ化された記録
• 正確なタイムスタンプで Twitch クリップ作成ページへワンクリック遷移
• 作成済みクリップのトラッキング
• 60日間の自動クリーンアップでデータを管理しやすく

プライバシー重視：
• すべてのデータはデバイスにローカル保存
• 分析、トラッキング、外部データ収集なし

## Privacy Policy URL

https://twitch-clip-todo.whatasoda.me/en/privacy

## Category

Entertainment

## Language

English, Japanese

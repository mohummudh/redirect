# Redirect

Redirect is a local macOS Safari Web Extension for exact URL-to-URL redirects.

You add rules in the Safari toolbar popup, for example:

- `youtube.com` -> a playlist URL
- one internal dashboard URL -> another
- one old page URL -> a newer replacement URL

This repo is set up for local use from Xcode. It is not packaged for the App Store.

## Features

- Multiple redirect rules
- Exact-match URL redirects
- Rule editor in the Safari popup
- Local storage with `browser.storage.local`
- Bare-domain input support like `youtube.com`
- Simple normalization so `www.example.com` and `example.com` match the same rule
- Dark terminal-style popup UI

## How Matching Works

- Only `http` and `https` URLs are considered.
- Matching is exact after normalization.
- URL fragments are ignored.
- `www.` is ignored for matching.
- Bare domains entered in the popup are normalized to `https://.../`.
- Redirects only happen when the current page exactly matches a saved `from` URL.

## macOS Only

This project only targets macOS Safari.

- `Redirect (macOS)` is the host app you run from Xcode.
- `Redirect Extension (macOS)` is the Safari Web Extension bundled inside that app.
- The host app exists to install/manage the extension in Safari.

## Requirements

- macOS
- Safari
- Xcode
- An Apple ID in Xcode if you want a normally signed local build

## Quick Start

1. Clone the repo.
2. Open `Redirect.xcodeproj` in Xcode.
3. Copy `Config/Local.xcconfig.example` to `Config/Local.xcconfig`.
4. Set these values in `Config/Local.xcconfig`:
   - `REDIRECT_DEVELOPMENT_TEAM`
   - `REDIRECT_APP_BUNDLE_IDENTIFIER`
   - `REDIRECT_EXTENSION_BUNDLE_IDENTIFIER`
5. Build and run the `Redirect (macOS)` scheme.
6. Open Safari and enable the `Redirect` extension in `Safari > Settings > Extensions`.
7. Grant website access for the sites you want to redirect from.
8. Click the Safari toolbar button and save your rules.

Example `Config/Local.xcconfig`:

```xcconfig
REDIRECT_DEVELOPMENT_TEAM = ABC123XYZ9
REDIRECT_APP_BUNDLE_IDENTIFIER = com.yourname.redirect
REDIRECT_EXTENSION_BUNDLE_IDENTIFIER = com.yourname.redirect.extension
```

## Signing Notes

`REDIRECT_DEVELOPMENT_TEAM` must be your Apple Team ID, not your email address.

If you do not already have a local signing identity:

1. Open `Xcode > Settings > Accounts`
2. Add your Apple ID
3. Select the account
4. Open `Manage Certificates...`
5. Add `Apple Development`

## If The Extension Does Not Show Up In Safari

Safari does not install the `.appex` directly. It sees the extension through the macOS host app.

Use this sequence:

1. Run the `Redirect (macOS)` app target from Xcode
2. Let the app launch
3. Open Safari
4. Go to `Safari > Settings > Extensions`
5. Enable `Redirect`

If it still does not appear:

1. Clean the build folder in Xcode
2. Quit Safari completely
3. Run the app again from Xcode
4. Reopen Safari

If you are using an unsigned or ad-hoc local build, Safari may require `Develop > Allow Unsigned Extensions`.

## If Redirects Do Not Trigger

Check these first:

- The extension is enabled in Safari
- Website access is allowed for the source site
- You are using the same Safari profile where the extension is enabled
- The current page exactly matches the saved `from` URL after normalization
- The rule is enabled in the popup

## Editing Rules

Rules are configured in the Safari popup, not in the macOS app window.

In Safari:

1. Click the `Redirect` toolbar button
2. Click `Add Rule`
3. Fill in `From URL`
4. Fill in `Redirect To`
5. Click `Save Rules`

Rules are stored locally with `browser.storage.local`.

## Repo Layout

- `Shared (Extension)/Resources/manifest.json`: Safari Web Extension manifest
- `Shared (Extension)/Resources/content.js`: redirect runtime
- `Shared (Extension)/Resources/popup.html`: popup markup
- `Shared (Extension)/Resources/popup.css`: popup styling
- `Shared (Extension)/Resources/popup.js`: popup rule editor logic
- `Shared (Extension)/SafariWebExtensionHandler.swift`: Safari extension entry point
- `Shared (App)/...`: host app UI/resources
- `macOS (App)/...`: macOS app entry point
- `macOS (Extension)/Info.plist`: extension target plist
- `Config/*.xcconfig`: public defaults plus local signing override support

## GitHub / Privacy Notes

This repo is intended to be safe to publish publicly.

- The tracked project uses placeholder bundle identifiers by default
- Personal signing values belong in `Config/Local.xcconfig`
- `Config/Local.xcconfig` is gitignored
- Xcode user state files are gitignored

Do not commit:

- `Config/Local.xcconfig`
- `xcuserdata`
- `.DS_Store`

## Development Notes

- The extension runs on normal web pages only
- Safari internal pages and non-web URLs are not redirected
- The popup seeds a default YouTube example rule on first launch
- This repo is for local builds from GitHub, not one-click installation

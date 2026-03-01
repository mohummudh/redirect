# Redirect

Redirect is a macOS Safari Web Extension packaged as an Xcode project. It lets you save exact URL-to-URL redirect rules from the Safari toolbar popup and run it locally from Xcode without App Store distribution.

## What It Does

- Redirects a page when its current URL exactly matches a saved source URL.
- Supports multiple rules.
- Stores rules locally with `browser.storage.local`.
- Treats `www.example.com` and `example.com` as the same source URL for matching.
- Ignores URL fragments (`#section`) when comparing rules.
- Runs only on normal `http` and `https` pages.

On first launch, the popup seeds the original YouTube playlist redirect rule as an example.

## macOS Only

This repo is intentionally set up for macOS Safari only.

- The Xcode project contains a macOS app target and a macOS Safari extension target.
- The host app exists only to install and manage the Safari extension locally.
- There is no App Store packaging or Apple distribution workflow in this repo.

## Quick Start

1. Clone the repo.
2. Open `Redirect.xcodeproj` in Xcode.
3. Copy `Config/Local.xcconfig.example` to `Config/Local.xcconfig`.
4. Fill in your Apple development team ID and your preferred app and extension bundle identifiers in `Config/Local.xcconfig`.
5. Build and run the macOS app target.
6. Enable the extension in Safari.
7. Grant website access for the sites you want to redirect from.
8. Open the toolbar popup and save your rules.

## Repo Layout

- `Shared (Extension)/Resources/manifest.json`: Safari Web Extension manifest.
- `Shared (Extension)/Resources/content.js`: Redirect runtime. Loads saved rules and redirects matching pages.
- `Shared (Extension)/Resources/popup.html`: Popup UI.
- `Shared (Extension)/Resources/popup.css`: Popup styling.
- `Shared (Extension)/Resources/popup.js`: Rule editor and storage logic.
- `Shared (Extension)/SafariWebExtensionHandler.swift`: Minimal Safari extension entry point required by the app extension target.
- `Shared (App)/...`: Shared host app resources used by the macOS target.
- `macOS (App)/...`: macOS app entry point and storyboard.
- `macOS (Extension)/Info.plist`: macOS extension target plist.

## Public Repo Notes

- The tracked project uses placeholder defaults: `com.example.redirect` and `com.example.redirect.extension`.
- Your local signing team and bundle IDs should go in `Config/Local.xcconfig`, which is gitignored.
- Xcode user state and user-specific metadata are ignored by `.gitignore`.
- This repo is meant for local builds from GitHub, not for one-click installation.

## Safari Access Requirements

Because rules are user-defined, the extension requests access to all regular websites (`http` and `https`). Safari still controls whether the extension can run:

- The extension must be enabled in Safari.
- Website access can still be allowed, denied, or limited by Safari.
- Safari profiles can have different extension settings.
- Private Browsing may need separate approval for extensions that can read browsing data.

Apple references:

- macOS Safari extensions and profile/private browsing behavior: https://support.apple.com/en-us/102343

## Rule Format

- Source and destination must be valid `http` or `https` URLs.
- If you enter a bare domain like `youtube.com`, the popup normalizes it to `https://youtube.com/`.
- A rule will not save if it redirects back to the same normalized URL.
- Changes apply on the next page load for matching tabs.

## Before You Push

1. Keep personal signing values in `Config/Local.xcconfig`, not in the Xcode UI, if you do not want them committed.
2. Change the example values in `Config/Local.xcconfig.example` only if you want different public defaults than `com.example.*`.
3. Update the app icon assets if you want final branding instead of the current project artwork.
4. Confirm the popup copy and README match the permission story you want users to see.
5. Test extension enablement, website access prompts, profile-specific behavior, and private browsing behavior on the Safari version you plan to support.

## Notes

- The repo intentionally excludes Xcode user state files.
- The extension does not redirect Safari internal pages or non-web URLs because it only runs on `http` and `https` pages.

# Greenhouse Security Code Helper

Chrome extension that detects Greenhouse security code emails in Gmail and shows the code with one-click copy (desktop notification, in-page toast, and extension popup).

## Project structure

- **src/** – Extension source (manifest, background, popup, options, offscreen, inject, refs).
- **build/** – Output of the build script; load this folder in Chrome as an unpacked extension.
- **assets/logo/** – Logo/icon asset (e.g. `greenhouse.jpg`) used as the extension icon in the build.
- **build.ps1** – Build logic (PowerShell).
- **build.bat** – Runs the build (double-click or `build.bat` from a shell).

## Quick start

1. Run **build.bat** (or `powershell -ExecutionPolicy Bypass -File build.ps1`) to produce the **build/** folder.
2. Open **SETUP.md** for Gmail OAuth, loading the extension, and options.

## Docs

- **SETUP.md** – Setup guide (Google Cloud, OAuth client ID, Connect Gmail, preferences).

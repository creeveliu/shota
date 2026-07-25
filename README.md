# Shota

An experimental Chrome Manifest V3 extension for selecting and capturing a visible DOM element in one click.

## Try the MVP

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked** and select this folder.
3. Open a webpage, click the Shota extension icon, then click **Start selecting**.
4. Hover a card and click it. The cropped PNG is copied directly to your clipboard.

## Keyboard shortcut

The default shortcut is `Ctrl+Alt+A` (Control + Option + A on macOS). To change it, open `chrome://extensions/shortcuts` and assign your preferred key combination to **Start element capture**.

The current MVP intentionally targets visible, above-the-fold elements. Full-page capture, cross-origin iframe selection, and polished export controls are next-step additions.

# Shota

An experimental Chrome Manifest V3 extension for selecting and capturing a visible DOM element in one click.

## Try the MVP

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked** and select this folder.
3. Open a webpage, click the Shota extension icon, then click **Start selecting**.
4. Hover a card and click it. The cropped PNG is copied directly to your clipboard.

## Keyboard shortcut

The default shortcut is `Option+Shift+A` on macOS. Other platforms use `Ctrl+Shift+A`. To change it, open `chrome://extensions/shortcuts` and assign your preferred key combination to **Start element capture**. Chrome does not allow `Ctrl+Alt` as a declared default because it conflicts with AltGr.

The current MVP intentionally targets visible, above-the-fold elements. Full-page capture, cross-origin iframe selection, and polished export controls are next-step additions.

The extension UI supports English and Simplified Chinese and follows the browser language.

The free MVP adds a small Shota watermark to each copied capture.

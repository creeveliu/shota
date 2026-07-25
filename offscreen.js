chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'COPY_CAPTURE') return;

  const source = new Image();
  source.onload = async () => {
    try {
      const scale = source.naturalWidth / message.viewportWidth;
      const { x, y, width, height } = message.rect;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext('2d');
      context.drawImage(source, x * scale, y * scale, width * scale, height * scale, 0, 0, canvas.width, canvas.height);

      const label = chrome.i18n.getMessage('watermarkText') || 'Captured with Shota';
      const padding = Math.max(8, Math.round(10 * scale));
      const fontSize = Math.max(11, Math.round(12 * scale));
      context.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      const textWidth = context.measureText(label).width;
      const badgeWidth = textWidth + padding * 2;
      const badgeHeight = fontSize + padding;
      const badgeX = canvas.width - badgeWidth - padding;
      const badgeY = canvas.height - badgeHeight - padding;
      context.fillStyle = 'rgba(25, 24, 23, 0.78)';
      context.beginPath();
      context.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, Math.round(badgeHeight / 2));
      context.fill();
      context.fillStyle = 'rgba(255, 255, 255, 0.94)';
      context.textBaseline = 'middle';
      context.fillText(label, badgeX + padding, badgeY + badgeHeight / 2 + 1);

      sendResponse({ ok: true, image: canvas.toDataURL('image/png') });
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  };
  source.onerror = () => sendResponse({ ok: false, error: 'Could not decode capture' });
  source.src = message.image;
  return true;
});

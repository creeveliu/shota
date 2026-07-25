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
      canvas.getContext('2d').drawImage(source, x * scale, y * scale, width * scale, height * scale, 0, 0, canvas.width, canvas.height);
      sendResponse({ ok: true, image: canvas.toDataURL('image/png') });
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  };
  source.onerror = () => sendResponse({ ok: false, error: 'Could not decode capture' });
  source.src = message.image;
  return true;
});

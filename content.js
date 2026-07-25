(() => {
  if (window.top !== window) return;

  const t = (key, fallback) => chrome.i18n.getMessage(key) || fallback;

  let active = false;
  let hovered = null;
  let outline = null;
  let hint = null;

  const ensureUi = () => {
    if (outline) return;
    outline = document.createElement('div');
    outline.id = '__shota_outline';
    outline.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;display:none;border:2px solid #ff5d47;background:rgba(255,93,71,.12);box-shadow:0 0 0 1px rgba(255,255,255,.8),0 6px 18px rgba(24,24,27,.14);transition:all 80ms ease-out;';
    document.documentElement.appendChild(outline);

    hint = document.createElement('div');
    hint.id = '__shota_hint';
    hint.textContent = t('pickerHint', 'Move to an element · click to capture · Esc to exit');
    hint.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483647;padding:9px 14px;border-radius:999px;background:#191817;color:#fff;font:600 12px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.01em;box-shadow:0 8px 22px rgba(25,24,23,.22);pointer-events:none;';
    document.documentElement.appendChild(hint);
  };

  const draw = (element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    outline.style.display = 'block';
    outline.style.left = `${Math.max(0, rect.left - 2)}px`;
    outline.style.top = `${Math.max(0, rect.top - 2)}px`;
    outline.style.width = `${Math.min(window.innerWidth - rect.left, rect.width + 4)}px`;
    outline.style.height = `${Math.min(window.innerHeight - rect.top, rect.height + 4)}px`;
  };

  const pick = (event) => {
    if (!active) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest('#__shota_outline,#__shota_hint')) return;
    hovered = target.closest('article,[role="article"],[data-testid*="tweet"],[data-testid*="card"]') || target;
    draw(hovered);
  };

  const stop = () => {
    active = false;
    hovered = null;
    outline?.remove();
    hint?.remove();
    outline = null;
    hint = null;
    document.removeEventListener('mousemove', pick, true);
    document.removeEventListener('click', capture, true);
    document.removeEventListener('keydown', onKey, true);
  };

  const capture = (event) => {
    if (!active || !hovered) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = hovered.getBoundingClientRect();
    const x = Math.max(0, rect.left);
    const y = Math.max(0, rect.top);
    const right = Math.min(window.innerWidth, rect.right);
    const bottom = Math.min(window.innerHeight, rect.bottom);
    const captureRect = { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
    // Hide the picker before capture so its outline and hint never enter the image.
    outline.style.display = 'none';
    hint.style.display = 'none';
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'SHOT_ELEMENT',
        rect: captureRect,
        viewportWidth: window.innerWidth
      }).then((result) => {
        if (hint) {
          hint.style.display = 'block';
          hint.textContent = result?.ok ? t('copied', 'Copied to clipboard') : `${t('copyFailed', 'Could not copy capture')}${result?.error ? `: ${result.error}` : ''}`;
        }
        setTimeout(stop, 700);
      }).catch(() => {
        if (hint) {
          hint.style.display = 'block';
          hint.textContent = t('copyFailed', 'Could not copy capture');
        }
        setTimeout(stop, 700);
      });
    }, 80);
    if (hint) hint.textContent = t('copying', 'Copying capture…');
  };

  const onKey = (event) => { if (event.key === 'Escape') stop(); };

  const start = () => {
    if (active) return;
    active = true;
    ensureUi();
    document.addEventListener('mousemove', pick, true);
    document.addEventListener('click', capture, true);
    document.addEventListener('keydown', onKey, true);
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_PICKER') start();
    if (message.type === 'STOP_PICKER') stop();
    if (message.type === 'WRITE_CLIPBOARD') {
      (async () => {
        try {
          window.focus();
          const response = await fetch(message.image);
          const blob = await response.blob();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
    }
  });
})();

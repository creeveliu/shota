const ensureOffscreen = async () => {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (!contexts.length) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Crop the selected screenshot and copy it to the clipboard.'
    });
  }
};

const startPicker = async (tabId) => {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'START_PICKER' });
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      await chrome.tabs.sendMessage(tabId, { type: 'START_PICKER' });
    } catch {
      // Chrome blocks extensions on a small set of privileged pages.
    }
  }
};

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'start-picker') return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id) startPicker(tab.id);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'SHOT_ELEMENT' || !sender.tab?.id) return;

  chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (dataUrl) => {
    if (chrome.runtime.lastError || !dataUrl) {
      sendResponse({ ok: false, error: chrome.runtime.lastError?.message || 'Capture failed' });
      return;
    }

    ensureOffscreen()
      .then(() => chrome.runtime.sendMessage({
        type: 'COPY_CAPTURE',
        image: dataUrl,
        rect: message.rect,
        viewportWidth: message.viewportWidth
      }))
      .then((result) => {
        if (!result?.ok) {
          sendResponse(result || { ok: false, error: 'Capture crop failed' });
          return;
        }
        return chrome.tabs.sendMessage(sender.tab.id, { type: 'WRITE_CLIPBOARD', image: result.image })
          .then(sendResponse)
          .catch((error) => sendResponse({ ok: false, error: error.message }));
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));
  });

  return true;
});

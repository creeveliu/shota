document.querySelectorAll('[data-i18n]').forEach((element) => {
  const message = chrome.i18n.getMessage(element.dataset.i18n);
  if (message) element.textContent = message;
});

document.querySelector('#start').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
    } catch {
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
      } catch {
        // Chrome blocks extensions on a small set of privileged pages.
      }
    }
  }
  window.close();
});

document.querySelector('#shortcut-settings').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  window.close();
});

document.addEventListener('keydown', (event) => { if (event.key === 'Enter') document.querySelector('#start').click(); });

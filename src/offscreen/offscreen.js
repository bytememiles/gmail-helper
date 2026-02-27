/**
 * Offscreen document for copying to clipboard (required in MV3 when copying from notification button).
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "copyToClipboard" && typeof msg.text === "string") {
    navigator.clipboard.writeText(msg.text).then(
      () => sendResponse({ ok: true }),
      (err) => sendResponse({ ok: false, error: err.message })
    );
    return true; // async response
  }
});

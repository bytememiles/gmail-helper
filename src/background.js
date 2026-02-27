/**
 * Greenhouse Security Code Helper - Background Service Worker
 * Polls Gmail API for Greenhouse security code emails, parses code, stores it,
 * shows notification and optionally injects toast into active tab.
 */

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const GREENHOUSE_FROM = "no-reply@us.greenhouse-mail.io";
const POLL_ALARM_NAME = "greenhouse-poll";
const DEFAULT_POLL_MINUTES = 1;

/**
 * Base64url decode (Gmail API uses base64url).
 */
function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(padded);
  }
}

/**
 * Extract security code from email HTML (first <h1> text).
 */
function extractCodeFromHtml(html) {
  const match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  return match ? match[1].trim() : null;
}

/**
 * Get HTML body from Gmail message payload (handles multipart).
 */
function getHtmlFromPayload(payload) {
  if (!payload) return null;
  if (payload.body && payload.body.data && payload.mimeType === "text/html") {
    return base64UrlDecode(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body && part.body.data) {
        return base64UrlDecode(part.body.data);
      }
    }
  }
  return null;
}

/**
 * Fetch OAuth token for Gmail API.
 */
async function getToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Call Gmail API.
 */
async function gmailApi(path, token) {
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail API: ${res.status} ${err}`);
  }
  return res.json();
}

/**
 * List recent messages from Greenhouse with "Security code" in subject.
 */
async function listGreenhouseSecurityMessages(token) {
  const q = `from:${GREENHOUSE_FROM} subject:Security code`;
  const list = await gmailApi(
    `/messages?q=${encodeURIComponent(q)}&maxResults=5`,
    token
  );
  return list.messages || [];
}

/**
 * Fetch full message and extract security code.
 */
async function fetchAndParseMessage(token, messageId) {
  const msg = await gmailApi(`/messages/${messageId}?format=full`, token);
  const html = getHtmlFromPayload(msg.payload);
  if (!html) return null;
  return extractCodeFromHtml(html);
}

/**
 * Load options from storage.
 */
async function getOptions() {
  const out = await chrome.storage.sync.get({
    pollIntervalMinutes: DEFAULT_POLL_MINUTES,
    showDesktopNotification: true,
    showToast: false,
    toastPosition: "topRight",
  });
  return out;
}

/**
 * Load last seen message ID for deduplication.
 */
async function getLastSeenId() {
  const { lastMessageId } = await chrome.storage.local.get("lastMessageId");
  return lastMessageId || null;
}

/**
 * Save code and optionally notify / inject toast.
 */
async function saveAndNotify(code, messageId) {
  await chrome.storage.local.set({
    lastCode: code,
    lastReceivedAt: Date.now(),
    lastMessageId: messageId,
  });

  const opts = await getOptions();

  if (opts.showDesktopNotification) {
    chrome.notifications.create({
      type: "basic",
      title: "Greenhouse security code",
      message: `Your code: ${code}`,
      buttons: [{ title: "Copy" }],
      requireInteraction: false,
    });
  }

  if (opts.showToast) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (
      activeTab &&
      activeTab.id &&
      activeTab.url &&
      !activeTab.url.startsWith("chrome://")
    ) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: (c, pos) => {
            window.__greenhouseToast = { code: c, position: pos };
          },
          args: [code, opts.toastPosition],
        });
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["inject/toast.js"],
        });
      } catch (e) {
        console.warn("Toast injection failed:", e.message);
      }
    }
  }
}

/**
 * Run one poll: list messages, find new one, parse code, save and notify.
 */
async function runPoll() {
  let token;
  try {
    token = await getToken();
  } catch (e) {
    console.warn("Greenhouse Helper: not signed in", e.message);
    return;
  }

  let messages;
  try {
    messages = await listGreenhouseSecurityMessages(token);
  } catch (e) {
    console.warn("Greenhouse Helper: list failed", e.message);
    return;
  }

  const lastSeenId = await getLastSeenId();
  // Process newest first; stop when we hit already-seen
  for (const { id } of messages) {
    if (id === lastSeenId) break;
    const code = await fetchAndParseMessage(token, id);
    if (code) {
      await saveAndNotify(code, id);
      return; // Only notify for the newest new message
    }
  }
}

/**
 * Schedule next poll via alarm.
 */
function schedulePoll() {
  getOptions().then((opts) => {
    const minutes = Math.max(
      1,
      Number(opts.pollIntervalMinutes) || DEFAULT_POLL_MINUTES
    );
    chrome.alarms.create(POLL_ALARM_NAME, { periodInMinutes: minutes });
  });
}

// Alarm: run poll
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === POLL_ALARM_NAME) runPoll();
});

// Install / startup: schedule poll and run once
chrome.runtime.onStartup.addListener(() => {
  schedulePoll();
  runPoll();
});
chrome.runtime.onInstalled.addListener(() => {
  schedulePoll();
  runPoll();
});

// Popup / options messages
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "checkNow") {
    runPoll()
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true; // async response
  }
  if (msg.type === "getLastCode") {
    chrome.storage.local.get(["lastCode", "lastReceivedAt"]).then(sendResponse);
    return true;
  }
  if (msg.type === "reschedulePoll") {
    schedulePoll();
    sendResponse({ ok: true });
    return false;
  }
});

// Notification button: Copy
chrome.notifications.onButtonClicked.addListener(
  async (notificationId, buttonIndex) => {
    if (buttonIndex !== 0) return; // "Copy" is first button
    const { lastCode } = await chrome.storage.local.get("lastCode");
    if (!lastCode) return;

    const existing = await chrome.offscreen.hasDocument();
    if (!existing) {
      await chrome.offscreen.createDocument({
        url: "offscreen/offscreen.html",
        reasons: ["CLIPBOARD"],
        justification: "Copy security code to clipboard",
      });
    }
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "copyToClipboard", text: lastCode },
        () => {
          setTimeout(() => {
            chrome.notifications.clear(notificationId);
            resolve();
          }, 2500);
        }
      );
    });
  }
);

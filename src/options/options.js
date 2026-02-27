/**
 * Options page: Gmail connect, desktop notification, in-page toast, toast position, poll interval.
 */
const connectBtn = document.getElementById("connect-btn");
const gmailStatus = document.getElementById("gmail-status");
const showDesktopNotification = document.getElementById(
  "show-desktop-notification"
);
const showToast = document.getElementById("show-toast");
const toastPosition = document.getElementById("toast-position");
const pollInterval = document.getElementById("poll-interval");
const saveBtn = document.getElementById("save-btn");
const saveStatus = document.getElementById("save-status");

async function loadOptions() {
  const opts = await chrome.storage.sync.get({
    showDesktopNotification: true,
    showToast: false,
    toastPosition: "topRight",
    pollIntervalMinutes: 1,
  });
  showDesktopNotification.checked = opts.showDesktopNotification;
  showToast.checked = opts.showToast;
  toastPosition.value = opts.toastPosition;
  pollInterval.value = String(opts.pollIntervalMinutes);
}

async function checkGmailConnection() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      resolve(!!token && !chrome.runtime.lastError);
    });
  });
}

connectBtn.addEventListener("click", async () => {
  connectBtn.disabled = true;
  gmailStatus.textContent = "Connecting…";
  gmailStatus.className = "status";
  try {
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError)
          reject(new Error(chrome.runtime.lastError.message));
        else resolve(token);
      });
    });
    if (token) {
      gmailStatus.textContent = "Connected.";
      gmailStatus.className = "status success";
    } else {
      gmailStatus.textContent = "Could not connect.";
      gmailStatus.className = "status error";
    }
  } catch (e) {
    gmailStatus.textContent = e.message || "Connection failed.";
    gmailStatus.className = "status error";
  } finally {
    connectBtn.disabled = false;
  }
});

showToast.addEventListener("change", async () => {
  if (showToast.checked) {
    try {
      const granted = await chrome.permissions.request({
        origins: ["<all_urls>"],
      });
      if (!granted) {
        showToast.checked = false;
        saveStatus.textContent =
          'Permission for "all sites" is required for in-page toast on any tab.';
        saveStatus.className = "status error";
      }
    } catch (e) {
      showToast.checked = false;
    }
  }
});

saveBtn.addEventListener("click", async () => {
  const opts = {
    showDesktopNotification: showDesktopNotification.checked,
    showToast: showToast.checked,
    toastPosition: toastPosition.value,
    pollIntervalMinutes: Math.max(1, parseInt(pollInterval.value, 10) || 1),
  };
  await chrome.storage.sync.set(opts);

  chrome.runtime.sendMessage({ type: "reschedulePoll" }).catch(() => {});

  saveStatus.textContent = "Saved.";
  saveStatus.className = "status success";
  setTimeout(() => {
    saveStatus.textContent = "";
  }, 2000);
});

(async () => {
  await loadOptions();
  const connected = await checkGmailConnection();
  if (connected) {
    gmailStatus.textContent = "Connected.";
    gmailStatus.className = "status success";
  } else {
    gmailStatus.textContent = 'Not connected. Click "Connect Gmail".';
    gmailStatus.className = "status";
  }
})();

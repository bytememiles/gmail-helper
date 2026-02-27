/**
 * Popup: show last Greenhouse security code, Copy, and Check for new code.
 */
const codeValueEl = document.getElementById("code-value");
const codeTimeEl = document.getElementById("code-time");
const codeSection = document.getElementById("code-section");
const noCodeEl = document.getElementById("no-code");
const copyBtn = document.getElementById("copy-btn");
const checkNowBtn = document.getElementById("check-now-btn");
const statusEl = document.getElementById("status");

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return "Just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min ago`;
  if (diffMs < 86400000)
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function render(lastCode, lastReceivedAt) {
  if (lastCode) {
    codeSection.classList.remove("hidden");
    noCodeEl.classList.add("hidden");
    codeValueEl.textContent = lastCode;
    codeTimeEl.textContent = lastReceivedAt ? formatTime(lastReceivedAt) : "";
    copyBtn.disabled = false;
  } else {
    codeSection.classList.add("hidden");
    noCodeEl.classList.remove("hidden");
    codeValueEl.textContent = "—";
    copyBtn.disabled = true;
  }
}

function setStatus(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.style.color = isError ? "#c62828" : "#666";
}

async function load() {
  const { lastCode, lastReceivedAt } = await chrome.storage.local.get([
    "lastCode",
    "lastReceivedAt",
  ]);
  render(lastCode || null, lastReceivedAt || null);
}

copyBtn.addEventListener("click", async () => {
  const { lastCode } = await chrome.storage.local.get("lastCode");
  if (!lastCode) return;
  try {
    await navigator.clipboard.writeText(lastCode);
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("copied");
    }, 2000);
  } catch (e) {
    setStatus("Copy failed", true);
  }
});

checkNowBtn.addEventListener("click", async () => {
  checkNowBtn.disabled = true;
  setStatus("Checking…");
  try {
    const res = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "checkNow" }, resolve);
    });
    if (res && res.ok) {
      setStatus("Checked.");
      await load();
      setTimeout(() => setStatus(""), 2000);
    } else {
      setStatus(res && res.error ? res.error : "Check failed", true);
    }
  } catch (e) {
    setStatus("Check failed", true);
  } finally {
    checkNowBtn.disabled = false;
  }
});

load();

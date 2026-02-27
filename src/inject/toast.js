/**
 * Injected script: reads code and position from window.__greenhouseToast (set by background),
 * shows a toast with Copy button, then removes it 2–3 s after Copy is clicked.
 */
(function () {
  const data = window.__greenhouseToast;
  if (!data || typeof data.code !== "string") return;
  const code = data.code;
  const position = data.position || "topRight";
  delete window.__greenhouseToast;

  const DISMISS_MS = 2500;

  const positions = {
    topRight: { top: "16px", right: "16px", left: "auto", bottom: "auto" },
    topLeft: { top: "16px", left: "16px", right: "auto", bottom: "auto" },
    bottomRight: { bottom: "16px", right: "16px", left: "auto", top: "auto" },
    bottomLeft: { bottom: "16px", left: "16px", right: "auto", top: "auto" },
  };
  const pos = positions[position] || positions.topRight;

  const wrap = document.createElement("div");
  wrap.id = "greenhouse-toast-helper";
  wrap.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    ${Object.entries(pos)
      .map(([k, v]) => `${k}: ${v};`)
      .join(" ")}
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    min-width: 200px;
  `;

  const title = document.createElement("div");
  title.textContent = "Greenhouse security code";
  title.style.cssText =
    "font-weight: 600; margin-bottom: 8px; font-size: 12px; color: #666;";
  wrap.appendChild(title);

  const codeEl = document.createElement("div");
  codeEl.textContent = code;
  codeEl.style.cssText =
    "font-family: ui-monospace, monospace; font-size: 18px; font-weight: 600; letter-spacing: 0.06em; margin-bottom: 10px; word-break: break-all;";
  wrap.appendChild(codeEl);

  const btn = document.createElement("button");
  btn.textContent = "Copy";
  btn.style.cssText = `
    padding: 6px 12px;
    background: #15372c;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  `;

  function dismiss() {
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
  }

  btn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        btn.textContent = "Copied!";
        btn.style.background = "#2e7d32";
        setTimeout(dismiss, DISMISS_MS);
      })
      .catch(() => {});
  });

  wrap.appendChild(btn);
  document.body.appendChild(wrap);
})();

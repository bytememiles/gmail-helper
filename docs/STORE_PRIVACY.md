# Chrome Web Store – Privacy section (copy-paste guide)

Use this when filling the **Privacy** section of your Chrome Web Store listing for Greenhouse Security Code Helper. Replace placeholders (e.g. your privacy policy URL) before submitting.

---

## 1. Single purpose description*

**Max 1,000 characters.**

```
This extension has a single purpose: to help users quickly copy Greenhouse job-application security codes from their Gmail inbox.

It periodically checks Gmail (via the official Gmail API) for emails from Greenhouse containing a security code, extracts the code from the email body, and lets the user view it in the extension popup or receive a desktop/in-page notification with a one-click copy button. No code is sent to any server; all processing happens on the user's device. The extension only reads emails that match Greenhouse security-code messages and only stores the latest code and user preferences locally.
```

---

## 2. Permission justifications*

**Each field: max 1,000 characters.**

### identity justification*
```
Required to sign in with the user's Google account so the extension can read their Gmail via the Gmail API. The extension uses Chrome's identity API to obtain an OAuth token with read-only Gmail scope. This is the only way to access Gmail programmatically in a Chrome extension. No credentials are stored by the extension; token handling is done by Chrome.
```

### storage justification*
```
Used to store: (1) the user's preferences (e.g. notification on/off, toast position, check interval), and (2) the most recently extracted Greenhouse security code and its timestamp, so the user can see and copy it from the popup. All data stays on the user's device and is not sent to any third party.
```

### notifications justification*
```
Used to show a desktop notification when a new Greenhouse security code email is detected. The notification displays the code and a "Copy" button so the user can paste it into the application form without opening Gmail. This is the extension's core feature for alerting the user.
```

### clipboardWrite justification*
```
Used when the user clicks "Copy" in the extension popup, in the desktop notification, or in the in-page toast. It writes only the Greenhouse security code to the clipboard so the user can paste it into the application form. No other content is ever written to the clipboard by the extension.
```

### scripting justification*
```
Used to inject a small toast UI into the user's current browser tab when a new security code is detected (if the user enabled this option). The injected script only displays the code and a Copy button; it does not read or modify page content. This permission is required because the toast can appear on any site the user has open.
```

### offscreen justification*
```
Required in Manifest V3 to copy the security code to the clipboard when the user clicks "Copy" on the desktop notification. The background service worker cannot access the clipboard directly; the offscreen document performs the copy on behalf of the user action. No data is sent or stored in the offscreen document.
```

### alarms justification*
```
Used to run a periodic check for new Greenhouse security-code emails in Gmail (e.g. every 1–2 minutes as configured by the user). This allows the extension to notify the user shortly after the email arrives without requiring the user to keep Gmail open or manually refresh.
```

---

## 3. Host permission justification*

**Max 1,000 characters.**

```
• https://mail.google.com/* and https://www.googleapis.com/* — Required to call the Gmail API to list and read the user's emails. The extension only requests read-only access and only fetches messages from Greenhouse that contain a security code.

• <all_urls> (optional) — Listed under optional_host_permissions, not requested at install. Only if the user enables "Show in-page toast" in options, Chrome prompts once to allow access to all sites. That access is used solely to show a small floating toast on whichever tab is active when a new code arrives; the extension does not read, modify, or collect content from those sites. If the user does not enable the toast, the extension never requests this permission.
```

---

## 4. Are you using remote code?

**Select: No, I am not using remote code.**

All extension code is bundled in the extension package. The extension does not load or execute code from remote servers, CDNs, or eval'd strings from the network. Only the Gmail API is called to fetch email data (JSON); no scripts or HTML are loaded from the internet.

*(If the form still shows "Yes" and asks for a justification, you can leave the justification blank or state: "This extension does not use remote code. All logic is contained in the packaged extension.")*

---

## 5. Data usage – What user data do you plan to collect?

**Check only what applies.**

- **Personal communications** — Yes. The extension reads the user's Gmail messages (specifically Greenhouse security-code emails) to extract the security code. This data is not sent to any server; it is processed locally and only the extracted code and timestamp are stored locally for display and copy.

- **Authentication information** — Optional to check. The extension uses Google OAuth (Chrome identity API) to access Gmail. Passwords and credentials are never handled or stored by the extension; Chrome manages tokens. If the store asks for “authentication information,” you can check this and explain that you only use OAuth tokens provided by Chrome for Gmail API access.

Do **not** check: Health information, Financial and payment information, Location, Web history, User activity (e.g. keystroke logging), Website content (you are not collecting content from arbitrary sites)—unless your implementation actually does any of these.

---

## 6. User data disclosures

**Check all three:**

1. I do not sell or transfer user data to third parties, outside of the approved use cases.
2. I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
3. I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 7. Privacy policy URL*

You **must** host a privacy policy and enter its URL (e.g. `https://yoursite.com/privacy` or a GitHub Pages URL).

**Minimum content to include:**

- Name of the extension and that it is a Chrome extension.
- What data is used: Gmail access (read-only) for Greenhouse security-code emails; the last extracted code and preferences stored locally; OAuth handled by Chrome.
- That no data is sent to your servers or sold to third parties.
- That data stays on the user's device except for Gmail API calls to Google (as per Google's APIs Terms of Service).
- How users can revoke access (remove the extension; revoke access in Google account settings).
- Contact information (email or support link).

**Example URL:** If you host the policy on GitHub Pages or your own site, use that full URL (e.g. `https://yourusername.github.io/gmail-helper/privacy` or `https://yourdomain.com/gmail-helper-privacy`).

---

## Summary checklist

| Section | Action |
|--------|--------|
| Single purpose | Paste the single-purpose description above. |
| identity / storage / notifications / clipboardWrite / scripting / offscreen / alarms | Paste each justification above into the corresponding field. |
| Host permission justification | Paste the host justification above. |
| Remote code | Select **No**. |
| Data usage | Check **Personal communications** (and **Authentication information** if the form includes it and you use OAuth). |
| User data disclosures | Check all three boxes. |
| Privacy policy URL | Add your live privacy policy URL. |

After filling everything, save and submit for review. The warning about “in-depth review” due to host permissions is normal for extensions that access Gmail or all URLs; your justifications explain why each permission is needed.

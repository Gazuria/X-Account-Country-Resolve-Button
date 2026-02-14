# 🌍 X Country Flag Button

Adds a country flag next to usernames on X (Twitter) based on the user's **"Account based in"** location.

Works with:
- Tampermonkey
- Greasemonkey
- Violentmonkey

---

## ✨ Features

- 🌐 Displays country flag next to usernames
- ⏳ Click-to-fetch when not cached
- 🧠 Long-term local caching
- 🔄 Auto-detects dynamically loaded users
- ⚡ Lightweight and client-side only

---

## 📦 Installation

1. Install a userscript manager:
   - https://www.tampermonkey.net/
   - Greasemonkey (Firefox)
   - Violentmonkey

2. Open the dashboard  
3. Create a new script  
4. Paste the script  
5. Save  

---

## 🔐 Required Permissions

```js
@grant GM_xmlhttpRequest
@grant GM_setValue
@grant GM_getValue
@connect api.twitter.com
@connect api.x.com

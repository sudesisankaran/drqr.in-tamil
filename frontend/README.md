# 🏥 Smart Health Portal

## Emergency QR Code Scanner Module

**Project Title:**
**Smart Health Portal – A Secure Patient–Doctor Medical Record Management System**

---

## 📘 Overview

The Smart Health Portal is a healthcare-focused web application designed to securely manage patient–doctor medical records.
This module introduces a **modern QR code–based emergency scanning system**, enabling instant access to patient medical information during emergencies.

The QR Scanner is built using **secure web camera APIs**, ensuring privacy, speed, and real-time verification across devices.

---

## 🚀 Features Implemented

### 📸 Camera-Based QR Scanning

* Real-time QR code scanning
* Uses device camera via browser APIs
* Fast and accurate detection
* Works on laptop and mobile devices

---

### 🔄 Multi-Camera Support

* Front camera support
* Back camera support
* Smooth camera switching
* Automatic camera re-synchronization

---

### 🪞 Front Camera Mirroring

* Front camera preview mirrored for natural selfie view
* Back camera remains normal
* Scan decoding remains unaffected

---

### 🔳 Square Scanner UI

* Fixed 1:1 square scanning area
* Professional scanner layout
* Focused QR detection zone
* Reduces background distraction

---

### 🎯 Modern UI Enhancements

* Dark overlay background
* Green corner scan frame
* Animated scan laser
* Smooth transitions
* Professional hospital-grade interface

---

### 🔁 Camera Switching UX

* Smooth placeholder during camera switch
* “Switching camera…” loading indicator
* No flicker or broken layout

---

### 📱 Mobile Optimized

* Fully responsive design
* Optimized for emergency use
* Works smoothly on Android mobile browsers

---

## 🔐 HTTPS & Camera Security

Modern browsers allow camera access **only in secure contexts**.

Camera access is permitted on:

* ✅ `https://domain`
* ✅ `http://localhost`

Camera access is blocked on:

* ❌ `http://192.168.x.x`
* ❌ `http://172.x.x.x`

To enable camera usage on local networks, this project uses **mkcert**.

---

## 🛠️ mkcert Setup (Local HTTPS)

### Why mkcert?

mkcert creates locally trusted SSL certificates, allowing:

* Camera access on LAN
* Mobile testing
* Secure browser context

---

### 📌 Installation (Windows)

#### Install mkcert

```powershell
choco install mkcert
```

If Chocolatey is not installed:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Then:

```powershell
choco install mkcert
```

---

### 📌 Install Local CA

```powershell
mkcert -install
```

Expected output:

```
The local CA is now installed in the system trust store!
```

---

### 📌 Generate Certificate

Replace with your local IP:

```powershell
mkcert localhost 172.24.63.177
```

Generated files:

```
localhost+2.pem
localhost+2-key.pem
```

---

### 📌 Configure Vite HTTPS

Create folder:

```
/web-app/cert
```

Rename:

```
localhost+2.pem       → cert.pem
localhost+2-key.pem   → key.pem
```

Update `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    https: {
      key: fs.readFileSync("./cert/key.pem"),
      cert: fs.readFileSync("./cert/cert.pem"),
    },
  },
});
```

---

### ▶ Run Secure Server

```bash
npm run dev -- --host
```

Open:

```
https://172.24.63.177:5173
```

Verify:

```js
window.isSecureContext
```

Output should be:

```
true
```

---

## 🧠 Technical Stack

* **Frontend:** React + TypeScript
* **Styling:** Tailwind CSS
* **QR Engine:** html5-qrcode
* **Icons:** Lucide React
* **Build Tool:** Vite
* **Security:** HTTPS (mkcert)

---

## 📂 Files Modified

```
src/pages/ScanPage.tsx
tailwind.config.js
vite.config.ts
```

---

## 🔍 How It Works

1. User opens Emergency QR Scanner
2. Secure camera permission is requested
3. User starts scanning
4. Square scanning frame appears
5. QR code is detected in real time
6. QR data is displayed
7. (Future) Data sent to backend for medical record verification

---

## 🧪 Tested On

* ✅ Laptop webcam
* ✅ Android mobile browser
* ✅ Local network (HTTPS)
* ✅ Chrome / Edge

---

## 🎓 Academic Value

This module demonstrates:

* Real-world browser security handling
* HTTPS-based camera integration
* Emergency healthcare system design
* Advanced UI/UX engineering
* Real-time device interaction

Ideal for:

* MCA Final Semester Project
* Viva demonstration
* Healthcare system prototype
# Mneme World Generator (MWG)

> **Source:** [Mneme World Generator — DriveThruRPG](https://www.drivethrurpg.com/en/product/403824/mneme-world-generator) by Justin Aquino and Nicco Salonga\
> The public preview includes the full book, but with a watermark.\
> **Spreadsheet Version:** [Google Sheet — Mneme World Generator](https://docs.google.com/spreadsheets/d/1YiFA-THVnSGyMltVcDvS9nGlF4k8RFrjg89ZGNSw7ZM/edit?gid=1542365405#gid=1542365405) [(see footnote)](#spreadsheet-footnote)

A progressive web application for generating and managing fictional worlds, built with modern web technologies.

---

## 🚀 Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4 with custom theme tokens
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Fonts**: Inter (sans-serif), IBM Plex Mono (monospace)

---

## ✅ Prerequisites (Corrected)

> **Vite requirement**: Node.js **20.19+** or **22.12+**. We standardize on **Node 22 LTS**.

- **Node.js**: v22.12+ (recommended v22.20+)
- **Package Manager**: `pnpm` (via Corepack) or `npm`
- **Git**: latest stable

---

## 🧩 Install Node.js (Linux / macOS / Windows)

Choose **one** method for your OS.

### Linux (Ubuntu/Debian)

```bash
sudo apt purge -y nodejs npm 2>/dev/null || true
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
corepack enable
corepack prepare pnpm@latest --activate
```

### macOS

```bash
brew install node@22
corepack enable
corepack prepare pnpm@latest --activate
```

### Windows

```powershell
winget install OpenJS.NodeJS.LTS
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 🛠️ Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/StevenTiu22/mneme-world-generator-pwa.git
cd mneme-world-generator-pwa
```

### 2) Install dependencies

```bash
pnpm install
```

### 3) Run development server

```bash
pnpm dev
```

Visit `http://localhost:5173` or the network IP shown in the terminal.

---

## 🧪 Testing & Virtual Environment

Run a local test instance for live updates and debugging.

```bash
pnpm dev
```

Then, open `http://localhost:5173` in a browser. You can also test on your phone (same Wi‑Fi): open `http://<your-LAN-IP>:5173`.

---

## 📦 Build for Deployment

```bash
pnpm build
```

This generates an optimized `dist/` folder.

To preview the build locally:

```bash
pnpm preview
```

---

## 📱 Export to Phone or Tablet

1. Build the app (`pnpm build`)
2. Zip the `dist/` folder
3. Transfer to your device (via USB, AirDrop, or cloud)
4. Run a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
5. Open `http://127.0.0.1:8000` and choose **Add to Home Screen**.

This installs the app as a PWA on your phone.

---

## 🔄 Updating the App

Whenever an update is released:

1. Pull the latest code:
   ```bash
   git pull origin main
   ```
2. Reinstall dependencies:
   ```bash
   pnpm install
   ```
3. Rebuild the app:
   ```bash
   pnpm build
   ```
4. Redeploy or retransfer the updated `dist/` folder to your phone or server.

---

## 🧱 Docker Hosting (optional)

```bash
docker run -d --name mwg -p 8080:80 -v "$(pwd)/dist:/usr/share/nginx/html:ro" nginx:alpine
```

Then access via `http://localhost:8080`.

---

## 🧩 Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add dialog
```

---

## 🧭 Project Structure

```
mneme-world-generator-pwa/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
└── vite.config.ts
```

---

## 🧪 Troubleshooting

- **Vite not found** → Run `pnpm install` again.
- **crypto.hash error** → Upgrade Node to 22, reinstall.
- **LAN not reachable** → Check firewall or subnet.

---

## 🧱 Milestones

| Milestone | Description                         | Status     | % of Project | Timeline     |
| --------- | ----------------------------------- | ---------- | ------------ | ------------ |
| **1**     | Preparation Stage                   | ✅ Done     | 16%          | —            |
| **2**     | UI Stage                            | ✅ Done     | 32%          | —            |
| **3**     | Star Generation Stage               | 🔄 Ongoing | 48%          | Oct 17–31    |
| **3.1**   | Star Generation Phase               | 🔄 Ongoing | —            | Oct 24–30    |
| **3.2**   | Persistence (Export only for now)   | 🔄 Ongoing | —            | Oct 17–23    |
| **4**     | Primary World Generation and Export | ⏳ Pending  | —            | Oct 30–Nov 6 |
| **5**     | Save/Load & Import/Export Stage     | ⏳ Pending  | —            | Nov 7–13     |
| **6**     | Generate Disks and Planets          | ⏳ Pending  | —            | Nov 14–20    |

---

## 👤 Author

**Steven Tiu** — Author\
**Justin Cesar Aquino** — Project Sponsor

---

## 📄 License

This project is licensed under the **GNU General Public License v3 (GPL‑3.0)**. You are free to use, modify, and distribute this software, provided that all derived works remain open source under the same license.

---

## 🧾 Footnote: Spreadsheet Instructions {#spreadsheet-footnote}

The Google Sheets version includes a built‑in JavaScript roller and encoder. To use it safely:

1. **Copy the spreadsheet** — Go to *File → Make a Copy*.
2. **Approve permissions** — The first time you click *Generate System*, Google will prompt you to approve script execution. Review and allow the script to run.
3. **Save the results** — Once a world is generated, right‑click the *World Sheet* tab, select *Copy to → New Spreadsheet*, and rename it for record keeping.

> Sheet link: [https://docs.google.com/spreadsheets/d/1YiFA-THVnSGyMltVcDvS9nGlF4k8RFrjg89ZGNSw7ZM/edit?gid=1542365405#gid=1542365405](https://docs.google.com/spreadsheets/d/1YiFA-THVnSGyMltVcDvS9nGlF4k8RFrjg89ZGNSw7ZM/edit?gid=1542365405#gid=1542365405)

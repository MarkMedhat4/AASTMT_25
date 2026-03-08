# 🎓 StudyTracker — AASTMT Course Manager

> A personal academic dashboard built for AASTMT students to manage courses, track lectures, monitor progress, and never fall behind — all in one place.

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-aastmt--25.vercel.app-4F8EF7?style=flat-square)](https://aastmt-25.vercel.app/)
![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61DAFB?style=flat-square&logo=react)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)
![No Backend](https://img.shields.io/badge/Backend-None-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🔗 Links

| | |
|---|---|
| 🌐 **Live App** | https://aastmt-25.vercel.app/ |
| 💻 **Source Code** | https://github.com/MarkMedhat4/AASTMT_25 |

---

## ✨ Features

### 🔐 Auth & Multi-User
- Username + 4-digit PIN login (animated 4-box PIN input)
- Multiple isolated accounts on the same device
- Persistent sessions via `localStorage`
- Change display name and PIN anytime from Settings

### 👤 Account & Profile
- Upload a **profile photo** (shown in header + Settings)
- Edit your **display name** live — updates instantly everywhere
- **Change PIN** securely with current-PIN verification
- Per-user data isolation — each account has its own courses, schedule & lectures

### 📚 Course Management
- Fully dynamic — add any courses you want
- Custom **name**, **course code**, **color** (20-color palette + custom picker), and **icon** (75+ icons across 5 groups + custom emoji)
- Edit or delete courses anytime via Settings → Manage Courses

### 📅 Weekly Timetable
- Visual **grid layout** — days as rows, time slots as columns (just like your university schedule)
- Per-slot settings: Day, Time, Room, Type (Lect. / Sec. / Lab. / Other)
- **🔗 Meeting Links** — add a Teams / Zoom / Google Meet URL per slot, one click to join
- Click any cell to jump directly to that course's lecture tracker

### 📖 Lecture Tracker
- **Bulk upload** — select multiple PDFs and images at once (drag & drop supported)
- Auto-fills lecture name from the filename
- Each file gets its own editable name field before saving
- Mark each lecture as **Attended ✅** or **Studied 📖** with toggle buttons
- Add and edit **personal notes** per lecture
- Set a **📅 Deadline** per lecture with color-coded urgency badges:
  - 🔴 Overdue · 🟡 Due Today · 🟠 In 1–3 days · 📅 Future date
- **🔍 Real-time search** — filter lectures by name instantly
- Delete lectures individually

### 📊 Insights Dashboard
- Semester-wide stats: total lectures, attendance rate, study rate
- **Bar charts** for attendance and study progress per course
- Upcoming deadlines list sorted by urgency

### ⚙️ Settings Panel
- **☀️ / 🌙 Dark / Light Mode** — toggle from header or Settings (persisted)
- **Hide Completed Courses** — auto-declutter the dashboard
- **🔔 Browser Notifications** — 15-minute reminder before each class starts
- **⬇ Export Backup** — download all your data as a JSON file
- **⬆ Import / Restore** — restore from a backup on any device
- **🗑 Reset All** — wipe all lecture data (with confirmation dialog)

---

## 🚀 Getting Started

### Option A — Single HTML File *(Recommended)*
No build step. No dependencies. Just open or deploy.

```bash
# Open locally
open index.html

# Deploy to Vercel:
# Build Command  → (leave empty)
# Output Dir     → .
```

### Option B — Vite + React *(For development)*
```bash
npm install
npm run dev      # Start dev server at localhost:5173
npm run build    # Build for production → /dist
npm run preview  # Preview the production build
```

---

## 📁 Project Structure

```
index.html          ← Standalone app (React via CDN — no build needed)
src/
├── main.jsx        ← React entry point
├── App.jsx         ← Full component tree
index_vite.html     ← Entry HTML for the Vite project
vite.config.js      ← Vite configuration
package.json        ← Dependencies
README.md           ← You are here
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Styling | Pure CSS with CSS Variables (Dark / Light theming) |
| Fonts | Space Grotesk + JetBrains Mono (Google Fonts) |
| Storage | `localStorage` (per-user, namespaced keys) |
| Bundler | Vite *(optional)* or Babel Standalone via CDN |
| Deployment | Vercel |

---

## 💾 Data & Privacy

All data lives **only on your device** in `localStorage`. There is no backend, no server, and no external database.

- ✅ Fully offline — works without internet after first load
- ✅ No account registration with any external service
- ✅ No data ever leaves your browser
- ⚠️ Clearing browser data will erase progress — use **Export Backup** regularly
- 🔄 To transfer between devices, use **Export → Import** in Settings

### Storage Keys (per user `{u}`)

| Key | Contents |
|---|---|
| `st_courses_{u}` | Course list |
| `st_sched_{u}` | Weekly schedule slots |
| `st_data_{u}` | All lectures, notes, attendance |
| `st_settings_{u}` | UI preferences |
| `st_photo_{u}` | Profile photo (base64) |
| `st_session` | Current logged-in session |
| `st_theme` | Dark / Light preference |

---

## 🙌 Author

**Mark Medhat** — AASTMT Student  
Built to solve a real problem: keeping track of courses, weekly sessions, lecture PDFs, attendance, and deadlines — all without relying on any cloud service.

---

## 📄 License

MIT — free to use, modify, and share.

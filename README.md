# 🎓 StudyTracker — AASTMT Course Manager

> A personal academic tracker built for AASTMT students to manage courses, track lectures, monitor progress, and never fall behind — all in one place.

![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61DAFB?style=flat-square&logo=react)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![No Backend](https://img.shields.io/badge/Backend-None-orange?style=flat-square)

---

## ✨ Features

### 🔐 Auth & Multi-User
- Username + 4-digit PIN login system
- Multiple accounts on the same device, fully isolated
- Persistent sessions via `localStorage`

### 📚 Course Management
- Fully dynamic — add any courses you want
- Custom name, course code, color (20-color palette + color picker), and icon (75+ icons across 5 groups + custom emoji)
- Edit or delete courses at any time via Settings

### 📅 Schedule Management
- Build your weekly timetable from scratch
- Per-slot settings: Day, Time, Room, Type (Lect. / Sec. / Lab. / Other)
- **🔗 Meeting Links** — add a Teams/Zoom/Google Meet URL to any slot for one-click join directly from the timetable

### 📖 Lecture Tracker
- Add lectures per course with a name and optional PDF attachment
- Mark each lecture as **Attended** or **Studied** with visual toggle buttons
- Add and edit **personal notes** per lecture
- Set a **📅 Deadline** per lecture with color-coded urgency badges:
  - 🔴 Overdue · 🟡 Due Today · 🟠 In 1–3 days · 📅 Future date
- **🔍 Search** lectures by name in real time
- Delete lectures individually

### 📊 Insights Dashboard
- Overall semester stats: total lectures, attendance rate, study rate
- **Bar charts** for attendance and study progress per course
- Upcoming deadlines list sorted by urgency

### ⚙️ Settings Panel
- **☀️ / 🌙 Dark / Light Mode** toggle (preference saved across sessions)
- **Hide Completed Courses** — declutter the dashboard once a course is fully studied
- **🔔 Browser Notifications** — enable 15-minute reminders before each class
- **⬇ Export Backup** — download all your data as a JSON file
- **⬆ Import/Restore** — restore from a backup file on any device
- **🗑 Reset All** — wipe all lecture data to start a fresh semester (with confirmation)

---

## 🚀 Getting Started

This project comes in **two flavors** — choose what works best for you.

### Option A: Single HTML File (Recommended for deployment)
No build step. No dependencies. Just open or deploy.

```bash
# Open locally
open index.html

# Or deploy to Vercel — set:
# Build Command: (empty)
# Output Directory: .
```

### Option B: Vite + React Project (For development)
```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview the build
```

---

## 📁 Project Structure

```
index.html          ← Full standalone app (React via CDN, no build needed)
src/
├── main.jsx        ← React entry point
├── App.jsx         ← Full app component tree
index_vite.html     ← Entry HTML for the Vite project
vite.config.js      ← Vite configuration
package.json        ← Dependencies
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 |
| Styling | Pure CSS with CSS Variables (Dark/Light theming) |
| Fonts | Space Grotesk + JetBrains Mono (Google Fonts) |
| Storage | `localStorage` (per-user, namespaced) |
| Bundler | Vite (optional) or Babel Standalone (CDN mode) |
| Deployment | Vercel |

---

## 💾 Data & Privacy

All data lives **only on your device** in `localStorage`. There is no backend, no server, and no external database.

- ✅ Works offline
- ✅ No account registration required beyond a local username + PIN
- ⚠️ Clearing browser data will erase your progress — use **Export Backup** regularly
- 🔄 To move data between devices, use **Export → Import** in Settings

---

## 🙌 Author

**Mark Medhat** — AASTMT Student  
Built to solve a real problem: keeping track of courses, weekly sessions, lecture PDFs, attendance, and deadlines — all without relying on any cloud service.

---

## 📄 License

MIT — free to use, modify, and share.

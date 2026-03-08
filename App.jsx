import { useState, useEffect, useRef, useCallback } from "react";

// ─── Storage ──────────────────────────────────────────────────────────────────
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k),
};
const USERS_KEY = "st_users";
const SESSION_KEY = "st_session";
const dataKey = (u) => `st_data_${u}`;
const coursesKey = (u) => `st_courses_${u}`;
const schedKey = (u) => `st_sched_${u}`;
const settingsKey = (u) => `st_settings_${u}`;
const getUsers = () => store.get(USERS_KEY) || {};
const saveUsers = (u) => store.set(USERS_KEY, u);

// ─── Constants ────────────────────────────────────────────────────────────────
const TC = { "Lect.": "#4F8EF7", "Sec.": "#4FC28E", "Lab.": "#F76B4F", "Other": "#B44FF7" };
const PAL = ["#4F8EF7","#F76B4F","#4FC28E","#B44FF7","#F7C34F","#F74F9E","#4FD6F7","#FF8C42","#7BFF8C","#FFD700","#FF6B9D","#00CFFF","#A855F7","#F97316","#10B981","#EF4444","#8B5CF6","#06B6D4","#84CC16","#EC4899"];
const DAYS = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
const TYPES = ["Lect.","Sec.","Lab.","Other"];
const ICON_GROUPS = [
  { label: "Math & Science", icons: ["〜","∑","∇","∫","π","∞","⚗","🔬","🧪","🧬","📐","📏","🔭","⚛","🧮"] },
  { label: "Engineering",    icons: ["⚡","⚙","◈","🔧","🔩","💡","🖥","📡","🔌","🛠","⚖","🔋","📱","💻","🖨"] },
  { label: "General Study",  icons: ["📚","📖","📝","✏️","🎯","📌","📊","📈","📉","🗂","📋","🗒","📓","📔","🗃"] },
  { label: "Symbols",        icons: ["</>","★","◆","▲","●","◉","⬡","⬢","✦","✧","⊕","⊗","⊘","Ω","Δ"] },
  { label: "Fun",            icons: ["🚀","🎓","💎","🏆","⚔","🛡","🎲","🧩","🎮","🌟","🔥","💫","⚡","🌊","🎪"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const dlInfo = (deadline) => {
  if (!deadline) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline); dl.setHours(0, 0, 0, 0);
  const diff = Math.round((dl - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)   return { label: "Overdue " + Math.abs(diff) + "d", color: "#F74F4F", bg: "#2A1018", icon: "🔴" };
  if (diff === 0) return { label: "Due today!", color: "#F7C34F", bg: "#2A2010", icon: "🟡" };
  if (diff <= 3)  return { label: "In " + diff + "d", color: "#F7A44F", bg: "#2A1C10", icon: "🟠" };
  return { label: dl.toLocaleDateString("en", { month: "short", day: "numeric" }), color: "var(--t5)", bg: "var(--ib)", icon: "📅" };
};

// ─── PinInput ─────────────────────────────────────────────────────────────────
function PinInput({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const digits = (value || "").split("").concat(["", "", "", ""]).slice(0, 4);
  const handle = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = [...digits]; arr[i] = v; onChange(arr.join(""));
    if (v && i < 3) refs[i + 1].current.focus();
  };
  const handleKey = (i, e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current.focus(); };
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <input key={i} ref={refs[i]} className={"pinbox" + (digits[i] ? " filled" : "")}
          type="password" inputMode="numeric" maxLength={1}
          value={digits[i]} disabled={disabled}
          onChange={(e) => handle(i, e)} onKeyDown={(e) => handleKey(i, e)} onFocus={(e) => e.target.select()} />
      ))}
    </div>
  );
}

// ─── IconPicker ───────────────────────────────────────────────────────────────
function IconPicker({ value, onChange, color }) {
  const [custom, setCustom] = useState("");
  return (
    <div>
      {ICON_GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "var(--t5)", fontFamily: "'JetBrains Mono'", letterSpacing: 1, marginBottom: 6 }}>{g.label.toUpperCase()}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {g.icons.map((ic) => (
              <span key={ic} className="iopt" onClick={() => onChange(ic)}
                style={{ borderColor: value === ic ? (color || "#4F8EF7") : "var(--b2)", background: value === ic ? (color || "#4F8EF7") + "25" : "var(--ib)" }}>
                {ic}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 10, color: "var(--t5)", fontFamily: "'JetBrains Mono'", letterSpacing: 1, marginBottom: 6 }}>CUSTOM EMOJI</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. 🧲" style={{ flex: 1, fontSize: 18, textAlign: "center" }} />
          <button className="btn" onClick={() => { if (custom.trim()) onChange(custom.trim()); }} style={{ background: color || "#4F8EF7", color: "#fff", padding: "8px 16px" }}>Use</button>
        </div>
      </div>
    </div>
  );
}

// ─── ChartRow ─────────────────────────────────────────────────────────────────
function ChartRow({ label, val, max, color, icon }) {
  const pct = max ? Math.round((val / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <span>{icon}</span>}{label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: "var(--b2)", borderRadius: 99, height: 8, overflow: "hidden", flex: 1 }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${color},${color}CC)`, transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
function Auth({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const sw = (t) => { setTab(t); setErr(""); setPin(""); setUsername(""); setName(""); };
  const go = () => {
    setErr("");
    const u = username.trim().toLowerCase();
    if (!u) { setErr("Enter a username."); return; }
    if (pin.length !== 4) { setErr("PIN must be 4 digits."); return; }
    const users = getUsers();
    if (tab === "signup") {
      if (!name.trim()) { setErr("Enter your name."); return; }
      if (u.length < 3) { setErr("Username needs 3+ chars."); return; }
      if (users[u]) { setErr("Username taken!"); return; }
      setLoading(true);
      setTimeout(() => {
        users[u] = { pin, name: name.trim(), createdAt: new Date().toISOString() };
        saveUsers(users);
        const s = { username: u, name: name.trim() };
        store.set(SESSION_KEY, s); onAuth(s); setLoading(false);
      }, 500);
    } else {
      if (!users[u]) { setErr("Username not found."); return; }
      if (users[u].pin !== pin) { setErr("Wrong PIN!"); return; }
      setLoading(true);
      setTimeout(() => {
        const s = { username: u, name: users[u].name };
        store.set(SESSION_KEY, s); onAuth(s); setLoading(false);
      }, 400);
    }
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--pg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="fi" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", boxShadow: "0 8px 32px #4F8EF740" }}>🎓</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 22, letterSpacing: 3 }}>StudyTracker</div>
          <div style={{ fontSize: 13, color: "var(--t5)", marginTop: 5, letterSpacing: 1 }}>Your Personal Course Manager</div>
        </div>
        <div style={{ display: "flex", background: "var(--cb)", borderRadius: 12, padding: 4, marginBottom: 26, border: "1px solid var(--b1)" }}>
          {[["login", "🔑 Sign In"], ["signup", "✨ Sign Up"]].map(([t, l]) => (
            <button key={t} className="btn" onClick={() => sw(t)} style={{ flex: 1, background: tab === t ? "linear-gradient(135deg,#4F8EF7,#B44FF7)" : "transparent", color: tab === t ? "#fff" : "var(--t5)", borderRadius: 9, padding: "11px", fontSize: 14, fontWeight: 700 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "signup" && (
            <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6, letterSpacing: 1 }}>YOUR NAME</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={{ width: "100%" }} onKeyDown={(e) => e.key === "Enter" && go()} /></div>
          )}
          <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6, letterSpacing: 1 }}>USERNAME</label>
            <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="username (no spaces)" style={{ width: "100%" }} onKeyDown={(e) => e.key === "Enter" && go()} /></div>
          <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 14, letterSpacing: 1, textAlign: "center" }}>{tab === "login" ? "YOUR PIN" : "CHOOSE A 4-DIGIT PIN"}</label>
            <PinInput value={pin} onChange={setPin} disabled={loading} /></div>
          {err && <div style={{ background: "#2A1018", border: "1px solid #4A1520", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#F74F4F", textAlign: "center" }}>⚠️ {err}</div>}
          <button className="btn" onClick={go} disabled={loading || pin.length !== 4}
            style={{ background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", color: "#fff", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 10, marginTop: 4 }}>
            {loading ? <span><span className="spin" />Loading…</span> : (tab === "login" ? "Sign In →" : "Create Account →")}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "var(--t6)" }}>
          {tab === "login" ? "No account? " : "Have account? "}
          <span onClick={() => sw(tab === "login" ? "signup" : "login")} style={{ color: "#4F8EF7", cursor: "pointer", fontWeight: 600 }}>{tab === "login" ? "Sign Up" : "Sign In"}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COURSE SETUP
// ════════════════════════════════════════════════════════════
function CourseSetup({ courses, onSave, onSkip, isFirst }) {
  const [list, setList] = useState(courses || []);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const openAdd = () => { setForm({ id: Date.now(), name: "", code: "", color: "#4F8EF7", icon: "📚" }); setModal("add"); };
  const openEdit = (c) => { setForm({ ...c }); setModal("edit"); };
  const save = () => {
    if (!form.name.trim()) return;
    if (modal === "add") setList((l) => [...l, { ...form, id: Date.now() }]);
    else setList((l) => l.map((c) => (c.id === form.id ? form : c)));
    setModal(null); setForm({});
  };
  const del = (id) => setList((l) => l.filter((c) => c.id !== id));
  return (
    <div style={{ minHeight: "100vh", background: "var(--pg)", padding: 20 }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div className="fi" style={{ textAlign: "center", marginBottom: 32, paddingTop: 32 }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>📚</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{isFirst ? "Set Up Your Courses" : "Manage Courses"}</h1>
          <p style={{ color: "var(--t4)", fontSize: 14 }}>{isFirst ? "Add your courses — you can edit later" : "Add, edit, or remove courses"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {list.map((c) => (
            <div key={c.id} className="fi" style={{ background: "var(--cb)", border: `1px solid ${c.color}35`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, background: c.color + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: c.color, fontWeight: 700 }}>{c.code || "—"}</div>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
              </div>
              <button className="btn" onClick={() => openEdit(c)} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", padding: "5px 12px", fontSize: 12 }}>✏️</button>
              <button className="btn" onClick={() => del(c.id)} style={{ background: "#2A1018", color: "#F74F4F", border: "1px solid #4A1520", padding: "5px 12px", fontSize: 12 }}>🗑</button>
            </div>
          ))}
          {list.length === 0 && (
            <div style={{ background: "var(--cb)", border: "2px dashed var(--b1)", borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <div style={{ color: "var(--t5)", fontSize: 14 }}>No courses yet — add your first one!</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={openAdd} style={{ background: "#1E2A4A", color: "#4F8EF7", border: "1px solid #2E4070", padding: "11px 20px", fontSize: 14, flex: 1 }}>+ Add Course</button>
          <button className="btn" onClick={() => onSave(list)} disabled={list.length === 0} style={{ background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", color: "#fff", padding: "11px 24px", fontSize: 14, flex: 2 }}>
            {isFirst ? "Get Started →" : "Save Changes ✓"}
          </button>
          {isFirst && <button className="btn" onClick={onSkip} style={{ background: "transparent", color: "var(--t5)", border: "1px solid var(--b1)", padding: "11px 16px", fontSize: 13 }}>Skip</button>}
        </div>
      </div>
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} className="fi" style={{ background: "var(--cb)", border: "1px solid var(--b2)", borderRadius: 18, padding: "28px", maxWidth: 520, width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{modal === "add" ? "+ Add Course" : "✏️ Edit Course"}</h3>
            <div style={{ background: "var(--ib)", border: `2px solid ${form.color || "#4F8EF7"}50`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: (form.color || "#4F8EF7") + "25", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{form.icon || "?"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: form.color || "#4F8EF7", fontWeight: 700 }}>{form.code || "CODE"}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{form.name || "Course Name"}</div>
              </div>
              <span style={{ fontSize: 10, color: "var(--t6)" }}>PREVIEW</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>COURSE NAME *</label>
                  <input value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Signal And Systems" style={{ width: "100%" }} /></div>
                <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>COURSE CODE</label>
                  <input value={form.code || ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. EEC2201" style={{ width: "100%" }} /></div>
              </div>
              <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 8 }}>COLOR</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {PAL.map((col) => <div key={col} style={{ width: 26, height: 26, borderRadius: "50%", cursor: "pointer", background: col, border: `3px solid ${form.color === col ? "#fff" : "transparent"}`, transition: "all .15s" }} onClick={() => setForm((f) => ({ ...f, color: col }))} />)}
                  <input type="color" value={form.color || "#4F8EF7"} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} style={{ width: 32, height: 32, padding: 2, border: "1px solid var(--b2)", borderRadius: 8, cursor: "pointer" }} />
                </div>
              </div>
              <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 10 }}>ICON</label>
                <div style={{ background: "var(--pg)", borderRadius: 10, padding: "14px", maxHeight: 260, overflowY: "auto", border: "1px solid var(--b1)" }}>
                  <IconPicker value={form.icon} onChange={(ic) => setForm((f) => ({ ...f, icon: ic }))} color={form.color} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={() => setModal(null)} style={{ background: "var(--ib)", color: "var(--t4)", border: "1px solid var(--b2)", flex: 1 }}>Cancel</button>
              <button className="btn" onClick={save} disabled={!form.name?.trim()} style={{ background: form.color || "#4F8EF7", color: "#fff", flex: 2 }}>💾 Save Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SCHEDULE SETUP
// ════════════════════════════════════════════════════════════
function ScheduleSetup({ courses, schedule, onSave, onBack }) {
  const [slots, setSlots] = useState(schedule || []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const openAdd = () => { setForm({ id: Date.now(), courseId: courses[0]?.id || "", day: "Saturday", time: "", room: "", type: "Lect.", link: "" }); setModal(true); };
  const save = () => {
    if (!form.courseId || !form.time) return;
    setSlots((l) => { const ex = l.find((s) => s.id === form.id); return ex ? l.map((s) => (s.id === form.id ? form : s)) : [...l, form]; });
    setModal(false); setForm({});
  };
  const del = (id) => setSlots((l) => l.filter((s) => s.id !== id));
  const edit = (s) => { setForm({ ...s }); setModal(true); };
  const getCourse = (id) => courses.find((c) => c.id === id) || { name: "Unknown", color: "#4A5080", icon: "?" };
  const byDay = DAYS.reduce((a, d) => ({ ...a, [d]: slots.filter((s) => s.day === d) }), {});
  return (
    <div style={{ minHeight: "100vh", background: "var(--pg)", padding: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="fi" style={{ textAlign: "center", marginBottom: 28, paddingTop: 32 }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#4FC28E,#4F8EF7)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>📅</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Set Up Your Schedule</h1>
          <p style={{ color: "var(--t4)", fontSize: 14 }}>Add when and where each course meets — including online links</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {DAYS.map((day) => {
            const daySlots = byDay[day] || [];
            return (
              <div key={day} style={{ background: "var(--cb)", border: "1px solid var(--b1)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 18px", background: "var(--th)", borderBottom: daySlots.length ? "1px solid var(--b1)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#4F8EF7" }}>{day}</span>
                  {!daySlots.length && <span style={{ fontSize: 11, color: "var(--t6)" }}>No classes</span>}
                </div>
                {daySlots.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 18px" }}>
                    {daySlots.map((s) => { const c = getCourse(s.courseId); return (
                      <div key={s.id} style={{ background: c.color + "15", border: `1px solid ${c.color}40`, borderRadius: 9, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14 }}>{c.icon}</span>
                        <div>
                          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: c.color, fontWeight: 700 }}>{s.time}</div>
                          <div style={{ fontSize: 12, color: "var(--t2)", fontWeight: 600 }}>{c.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                            <span className="tag" style={{ background: (TC[s.type] || "#4A5080") + "20", color: TC[s.type] || "#4A5080", fontSize: 10 }}>{s.type}</span>
                            {s.room && <span className="tag" style={{ background: "#1A2040", color: "var(--t4)", fontSize: 10 }}>#{s.room}</span>}
                            {s.link && <span className="tag" style={{ background: "#0E1E3A", color: "#4F8EF7", fontSize: 10 }}>🔗 Online</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                          <button className="btn" onClick={() => edit(s)} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", padding: "3px 8px", fontSize: 11 }}>✏️</button>
                          <button className="btn" onClick={() => del(s.id)} style={{ background: "#2A1018", color: "#F74F4F", border: "1px solid #4A1520", padding: "3px 8px", fontSize: 11 }}>🗑</button>
                        </div>
                      </div>
                    ); })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={onBack} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", padding: "11px 18px", fontSize: 14 }}>← Back</button>
          <button className="btn" onClick={openAdd} style={{ background: "#1E2A4A", color: "#4F8EF7", border: "1px solid #2E4070", padding: "11px 20px", fontSize: 14, flex: 1 }}>+ Add Slot</button>
          <button className="btn" onClick={() => onSave(slots)} style={{ background: "linear-gradient(135deg,#4FC28E,#4F8EF7)", color: "#fff", padding: "11px 24px", fontSize: 14, flex: 2 }}>
            {slots.length === 0 ? "Skip Schedule →" : "Finish Setup ✓"}
          </button>
        </div>
      </div>
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="fi" style={{ background: "var(--cb)", border: "1px solid var(--b2)", borderRadius: 18, padding: "28px", maxWidth: 480, width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📅 Schedule Slot</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>COURSE</label>
                <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: Number(e.target.value) || e.target.value }))} style={{ width: "100%" }}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.code ? c.code + " — " : ""}{c.name}</option>)}
                </select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>DAY</label>
                  <select value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))} style={{ width: "100%" }}>
                    {DAYS.map((d) => <option key={d}>{d}</option>)}
                  </select></div>
                <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>TYPE</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ width: "100%" }}>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>TIME</label>
                  <input value={form.time || ""} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} placeholder="e.g. 8:30–10:30" style={{ width: "100%" }} /></div>
                <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>ROOM</label>
                  <input value={form.room || ""} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. A-209" style={{ width: "100%" }} /></div>
              </div>
              <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>🔗 MEETING LINK (optional)</label>
                <input value={form.link || ""} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://teams.microsoft.com/..." style={{ width: "100%" }} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={() => setModal(false)} style={{ background: "var(--ib)", color: "var(--t4)", border: "1px solid var(--b2)", flex: 1 }}>Cancel</button>
              <button className="btn" onClick={save} disabled={!form.courseId || !form.time} style={{ background: "#4FC28E", color: "#fff", flex: 2 }}>💾 Save Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SETTINGS DRAWER
// ════════════════════════════════════════════════════════════
function SettingsDrawer({ user, dat, courses, schedule, theme, toggleTheme, settings, setSettings, onClose, onResetAll, onManageCourses }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [notifStatus, setNotifStatus] = useState(Notification?.permission || "default");
  const importRef = useRef();

  const exportBackup = () => {
    const backup = { version: 1, exportedAt: new Date().toISOString(), username: user.username, courses, schedule, data: dat, settings };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `studytracker-backup-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importBackup = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const b = JSON.parse(ev.target.result);
        if (b.version !== 1) { alert("Invalid backup file."); return; }
        if (b.courses) store.set(coursesKey(user.username), b.courses);
        if (b.schedule) store.set(schedKey(user.username), b.schedule);
        if (b.data) store.set(dataKey(user.username), b.data);
        alert("✅ Backup restored! Refreshing…");
        setTimeout(() => window.location.reload(), 500);
      } catch { alert("Failed to parse backup file."); }
    };
    r.readAsText(file); e.target.value = "";
  };

  const requestNotifs = async () => {
    if (!("Notification" in window)) { alert("Notifications not supported."); return; }
    const p = await Notification.requestPermission();
    setNotifStatus(p);
    if (p === "granted") new Notification("StudyTracker 🎓", { body: "Notifications enabled!" });
  };

  const Toggle = ({ val, onChange }) => (
    <div onClick={() => onChange(!val)} style={{ width: 44, height: 24, background: val ? "#4F8EF7" : "var(--b2)", borderRadius: 12, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: val ? 20 : 3, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
  const Row = ({ label, desc, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--b1)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--t5)", marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199, backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 360, background: "var(--cb)", borderLeft: "1px solid var(--b1)", zIndex: 200, overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.4)", padding: 24, animation: "fi .25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700 }}>⚙️ Settings</div>
          <button className="btn" onClick={onClose} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", padding: "5px 10px", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ fontSize: 11, color: "#4F8EF7", fontFamily: "'JetBrains Mono'", letterSpacing: 2, marginBottom: 4 }}>DISPLAY</div>
        <Row label="Dark / Light Mode" desc={theme === "dark" ? "Currently: Dark" : "Currently: Light"}>
          <button className="btn" onClick={toggleTheme} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", fontSize: 18, padding: "4px 10px" }}>{theme === "dark" ? "☀️" : "🌙"}</button>
        </Row>
        <Row label="Hide Completed Courses" desc="Hide courses where all lectures are studied">
          <Toggle val={settings.hideCompleted || false} onChange={(v) => setSettings((s) => ({ ...s, hideCompleted: v }))} />
        </Row>
        <div style={{ fontSize: 11, color: "#4F8EF7", fontFamily: "'JetBrains Mono'", letterSpacing: 2, marginBottom: 4, marginTop: 20 }}>COURSES & SCHEDULE</div>
        <Row label="Manage Courses & Schedule" desc="Add, edit or remove courses and slots">
          <button className="btn" onClick={onManageCourses} style={{ background: "#1E2A4A", color: "#4F8EF7", border: "1px solid #2E4070", padding: "6px 14px", fontSize: 13 }}>Open →</button>
        </Row>
        <div style={{ fontSize: 11, color: "#4F8EF7", fontFamily: "'JetBrains Mono'", letterSpacing: 2, marginBottom: 4, marginTop: 20 }}>NOTIFICATIONS</div>
        <Row label="Class Reminders" desc={notifStatus === "granted" ? "✅ Enabled" : notifStatus === "denied" ? "❌ Blocked in browser" : "15-min reminder before class"}>
          {notifStatus !== "granted" && <button className="btn" onClick={requestNotifs} disabled={notifStatus === "denied"} style={{ background: "#1E2A4A", color: "#4F8EF7", border: "1px solid #2E4070", padding: "6px 14px", fontSize: 13 }}>Enable</button>}
          {notifStatus === "granted" && <span style={{ fontSize: 20 }}>✅</span>}
        </Row>
        <div style={{ fontSize: 11, color: "#4F8EF7", fontFamily: "'JetBrains Mono'", letterSpacing: 2, marginBottom: 4, marginTop: 20 }}>DATA MANAGEMENT</div>
        <Row label="Export Backup" desc="Download all data as JSON">
          <button className="btn" onClick={exportBackup} style={{ background: "#0E2A1E", color: "#4FC28E", border: "1px solid #1A5030", padding: "6px 14px", fontSize: 13 }}>⬇ Backup</button>
        </Row>
        <Row label="Import Backup" desc="Restore from a JSON backup file">
          <input ref={importRef} type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
          <button className="btn" onClick={() => importRef.current.click()} style={{ background: "#1E2A4A", color: "#4F8EF7", border: "1px solid #2E4070", padding: "6px 14px", fontSize: 13 }}>⬆ Restore</button>
        </Row>
        <div style={{ padding: "14px 0", borderBottom: "1px solid var(--b1)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>🗑 Reset All Data</div>
          <div style={{ fontSize: 12, color: "var(--t5)", marginBottom: 10 }}>Delete all lectures & notes for a new semester</div>
          {!confirmReset ? (
            <button className="btn" onClick={() => setConfirmReset(true)} style={{ background: "#2A1018", color: "#F74F4F", border: "1px solid #4A1520", padding: "7px 16px", fontSize: 13 }}>Reset All…</button>
          ) : (
            <div style={{ background: "#2A1018", border: "1px solid #4A1520", borderRadius: 10, padding: "12px" }}>
              <div style={{ fontSize: 13, color: "#F74F4F", marginBottom: 10, fontWeight: 600 }}>⚠️ Delete ALL lecture data?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => setConfirmReset(false)} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", flex: 1 }}>Cancel</button>
                <button className="btn" onClick={() => { onResetAll(); setConfirmReset(false); }} style={{ background: "#F74F4F", color: "#fff", flex: 1 }}>Yes, Reset</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 20, padding: "12px", background: "var(--ib)", borderRadius: 10, fontSize: 12, color: "var(--t5)", textAlign: "center", lineHeight: 1.6 }}>
          💾 Data saved locally on this device<br />Use Backup/Restore to transfer between devices
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// INSIGHTS VIEW
// ════════════════════════════════════════════════════════════
function InsightsView({ courses, dat }) {
  const gl = (id) => (dat[id] || { lectures: [] }).lectures;
  const allLects = courses.flatMap((c) => gl(c.id).map((l) => ({ ...l, courseId: c.id })));
  const totalL = allLects.length;
  const totalAtt = allLects.filter((l) => l.attended).length;
  const totalStd = allLects.filter((l) => l.studied).length;
  const attPct = totalL ? Math.round((totalAtt / totalL) * 100) : 0;
  const stdPct = totalL ? Math.round((totalStd / totalL) * 100) : 0;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const deadlines = allLects.filter((l) => l.deadline)
    .map((l) => { const c = courses.find((x) => x.id === l.courseId); const dl = new Date(l.deadline); dl.setHours(0, 0, 0, 0); return { ...l, course: c, diff: Math.round((dl - now) / (1000 * 60 * 60 * 24)) }; })
    .filter((l) => l.diff >= -7).sort((a, b) => a.diff - b.diff).slice(0, 10);

  return (
    <div className="fi">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>📊 Insights</h1>
        <p style={{ color: "var(--t4)", fontSize: 14 }}>Your overall progress this semester</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 32 }}>
        {[{ l: "Total Lectures", v: totalL, col: "#4F8EF7" }, { l: "Attended", v: totalAtt, col: "#4FC28E" }, { l: "Studied", v: totalStd, col: "#B44FF7" }, { l: "Attendance Rate", v: attPct + "%", col: "#F7C34F" }, { l: "Study Rate", v: stdPct + "%", col: "#F74F9E" }, { l: "Courses", v: courses.length, col: "#4FD6F7" }].map((s) => (
          <div key={s.l} style={{ background: "var(--cb)", border: `1px solid ${s.col}25`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: "var(--t5)", fontFamily: "'JetBrains Mono'", letterSpacing: 1, marginBottom: 6 }}>{s.l.toUpperCase()}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: s.col }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "var(--cb)", border: "1px solid var(--b1)", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, marginBottom: 20, color: "var(--t2)" }}>✅ Attendance per Course</div>
          {courses.map((c) => { const lects = gl(c.id); const att = lects.filter((l) => l.attended).length; return (
            <ChartRow key={c.id} label={c.code || c.name.slice(0, 12)} val={att} max={lects.length || 1} color={c.color} icon={c.icon} />
          ); })}
        </div>
        <div style={{ background: "var(--cb)", border: "1px solid var(--b1)", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, marginBottom: 20, color: "var(--t2)" }}>🧠 Study Progress per Course</div>
          {courses.map((c) => { const lects = gl(c.id); const std = lects.filter((l) => l.studied).length; return (
            <ChartRow key={c.id} label={c.code || c.name.slice(0, 12)} val={std} max={lects.length || 1} color="#B44FF7" icon={c.icon} />
          ); })}
        </div>
      </div>
      <div style={{ background: "var(--cb)", border: "1px solid var(--b1)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--t2)" }}>📅 Upcoming Deadlines</div>
        {deadlines.length === 0 ? (
          <div style={{ color: "var(--t5)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No upcoming deadlines 🎉</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {deadlines.map((l, i) => { const di = dlInfo(l.deadline); return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: di?.bg || "var(--ib)", borderRadius: 10, border: `1px solid ${di?.color || "var(--b2)"}30` }}>
                <span style={{ fontSize: 18 }}>{di?.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: "var(--t5)" }}>{l.course?.code || l.course?.name}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: di?.color, fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap" }}>{di?.label}</span>
              </div>
            ); })}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(true);
  const [setup, setSetup] = useState(null);
  const [view, setView] = useState("schedule");
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [dat, setDat] = useState({});
  const [settings, setSettingsState] = useState({ hideCompleted: false });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [theme, setTheme] = useState(() => store.get("st_theme") || "dark");
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const fRef = useRef();

  useEffect(() => { document.documentElement.className = theme === "light" ? "light" : ""; store.set("st_theme", theme); }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => { const s = store.get(SESSION_KEY); if (s) { setUser(s); loadUser(s.username); } setBoot(false); }, []);

  const scheduleReminders = useCallback((crs, sch) => {
    if (Notification?.permission !== "granted") return;
    const jsToDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayStr = jsToDay[new Date().getDay()];
    const now = new Date();
    sch.filter((s) => s.day === todayStr).forEach((slot) => {
      const [start] = slot.time.split("–");
      const [h, m] = (start || "").split(":").map(Number);
      if (isNaN(h)) return;
      const classTime = new Date(); classTime.setHours(h, m || 0, 0, 0);
      const reminderTime = new Date(classTime.getTime() - 15 * 60 * 1000);
      const diff = reminderTime - now;
      if (diff > 0 && diff < 8 * 60 * 60 * 1000) {
        const c = crs.find((x) => x.id === slot.courseId);
        setTimeout(() => new Notification(`🎓 Class in 15 min: ${c?.name || "Class"}`, { body: `${slot.time} — ${slot.room || "Online"}` }), diff);
      }
    });
  }, []);

  const loadUser = (u) => {
    const c = store.get(coursesKey(u)) || [];
    const s = store.get(schedKey(u)) || [];
    const d = store.get(dataKey(u)) || {};
    const st = store.get(settingsKey(u)) || { hideCompleted: false };
    setCourses(c); setSchedule(s); setDat(d); setSettingsState(st);
    if (c.length === 0) setSetup("courses");
    else scheduleReminders(c, s);
  };

  const setSettings = (updater) => {
    setSettingsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (user) store.set(settingsKey(user.username), next);
      return next;
    });
  };

  const onAuth = (s) => { setUser(s); loadUser(s.username); setView("schedule"); };
  const sd = (d) => { setDat(d); store.set(dataKey(user.username), d); };
  const saveCourses = (c) => { setCourses(c); store.set(coursesKey(user.username), c); };
  const saveSched = (s) => { setSchedule(s); store.set(schedKey(user.username), s); };
  const logout = () => { store.del(SESSION_KEY); setUser(null); setCourses([]); setSchedule([]); setDat({}); setSetup(null); setView("schedule"); };
  const resetAll = () => { const empty = {}; sd(empty); setDat(empty); };

  const gc = (id) => courses.find((c) => c.id === id || c.id === Number(id) || String(c.id) === String(id));
  const gl = (id) => (dat[id] || { lectures: [] }).lectures;
  const tl = (id) => gl(id).length;
  const sc = (id) => gl(id).filter((l) => l.studied).length;
  const ac = (id) => gl(id).filter((l) => l.attended).length;

  const addL = () => {
    const { cid, lname, pdfData, pdfName, deadline } = form;
    const d = { ...dat }; if (!d[cid]) d[cid] = { lectures: [] };
    d[cid].lectures.push({ id: Date.now(), name: lname || "Lecture " + (d[cid].lectures.length + 1), pdfData: pdfData || null, pdfName: pdfName || null, studied: false, notes: "", attended: false, addedAt: new Date().toLocaleDateString(), deadline: deadline || null });
    sd(d); setModal(null); setForm({});
  };
  const tog = (cid, idx, f) => { const d = { ...dat }; d[cid].lectures[idx][f] = !d[cid].lectures[idx][f]; sd(d); };
  const sn = () => { const { cid, li, notes } = form; const d = { ...dat }; d[cid].lectures[li].notes = notes; sd(d); setModal(null); setForm({}); };
  const dlDel = (cid, idx) => { const d = { ...dat }; d[cid].lectures.splice(idx, 1); sd(d); };
  const hf = (e) => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => { const nameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); setForm((f) => ({ ...f, pdfData: ev.target.result, pdfName: file.name, lname: f.lname || nameWithoutExt })); }; r.readAsDataURL(file); };

  if (boot) return (
    <div style={{ background: "var(--pg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "3px solid #1E2338", borderTopColor: "#4F8EF7", borderRadius: "50%", margin: "0 auto 14px", animation: "sp 1s linear infinite" }} />
        <div style={{ color: "var(--t6)", fontFamily: "monospace", fontSize: 12, letterSpacing: 3 }}>LOADING</div>
      </div>
    </div>
  );
  if (!user) return <Auth onAuth={onAuth} />;
  if (setup === "courses") return <CourseSetup courses={courses} isFirst={courses.length === 0} onSave={(c) => { saveCourses(c); setSetup("schedule"); }} onSkip={() => setSetup("schedule")} />;
  if (setup === "schedule") return <ScheduleSetup courses={courses} schedule={schedule} onBack={() => setSetup("courses")} onSave={(s) => { saveSched(s); setSetup(null); scheduleReminders(courses, s); }} />;

  const active = courses.find((c) => c.id === view);
  const uname = user.name || user.username;
  const byDay = DAYS.reduce((a, d) => ({ ...a, [d]: schedule.filter((s) => s.day === d) }), {});
  const visibleCourses = settings.hideCompleted ? courses.filter((c) => tl(c.id) === 0 || sc(c.id) < tl(c.id)) : courses;

  return (
    <div style={{ background: "var(--pg)", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ background: "var(--cb)", borderBottom: "1px solid var(--b1)", padding: "0 20px", display: "flex", alignItems: "center", gap: 12, height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div onClick={() => setView("schedule")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎓</div>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, color: "var(--t1)", letterSpacing: 1 }}>StudyTracker</span>
        </div>
        {active && view !== "schedule" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{ color: "var(--t6)", flexShrink: 0 }}>›</span>
            <span style={{ fontSize: 13, color: "var(--t4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.name}</span>
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--ib)", border: "1px solid var(--b2)", borderRadius: 20, padding: "5px 13px" }}>
            <div style={{ width: 22, height: 22, background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{uname[0].toUpperCase()}</div>
            <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uname}</span>
          </div>
          <button className="btn" onClick={() => setShowTimetable(true)} style={{ background: "transparent", color: "var(--t4)", border: "1px solid var(--b1)", padding: "6px 10px", fontSize: 13 }}>📅</button>
          <button className="btn" onClick={() => setView("insights")} style={{ background: view === "insights" ? "#2A1E3A" : "transparent", color: view === "insights" ? "#B44FF7" : "var(--t4)", border: "1px solid " + (view === "insights" ? "#4A2E6A" : "transparent"), padding: "6px 10px", fontSize: 13 }}>📊</button>
          <button className="btn" onClick={toggleTheme} style={{ background: "transparent", color: "var(--t4)", border: "1px solid var(--b1)", padding: "6px 9px", fontSize: 16, lineHeight: 1 }}>{theme === "dark" ? "☀️" : "🌙"}</button>
          <button className="btn" onClick={() => setShowSettings(true)} style={{ background: "transparent", color: "var(--t5)", border: "1px solid var(--b1)", padding: "6px 9px", fontSize: 13 }}>⚙️</button>
          <button className="btn" onClick={logout} style={{ background: "transparent", color: "var(--t5)", border: "1px solid var(--b1)", padding: "6px 10px", fontSize: 12 }}>Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {/* INSIGHTS */}
        {view === "insights" && <InsightsView courses={courses} dat={dat} />}

        {/* SCHEDULE */}
        {view === "schedule" && (
          <div className="fi">
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>👋 Hey, {uname.split(" ")[0]}!</h1>
              <p style={{ color: "var(--t4)", fontSize: 14 }}>Your personal study dashboard 💾</p>
            </div>
            {courses.length === 0 ? (
              <div style={{ background: "var(--cb)", border: "2px dashed var(--b1)", borderRadius: 16, padding: "60px 20px", textAlign: "center", marginBottom: 30 }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📚</div>
                <div style={{ color: "var(--t5)", fontSize: 16, marginBottom: 8 }}>No courses set up yet</div>
                <button className="btn" onClick={() => setSetup("courses")} style={{ background: "linear-gradient(135deg,#4F8EF7,#B44FF7)", color: "#fff", padding: "10px 24px", fontSize: 14 }}>Set Up Courses →</button>
              </div>
            ) : (
              <>
                {settings.hideCompleted && visibleCourses.length < courses.length && (
                  <div style={{ fontSize: 12, color: "var(--t5)", marginBottom: 12, background: "var(--ib)", padding: "7px 14px", borderRadius: 8, display: "inline-block" }}>
                    👁 Hiding {courses.length - visibleCourses.length} completed course(s)
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, marginBottom: 36 }}>
                  {visibleCourses.map((c) => {
                    const tot = tl(c.id), std = sc(c.id), att = ac(c.id), pct = tot ? Math.round((std / tot) * 100) : 0;
                    return (
                      <div key={c.id} className="hcard" style={{ background: "var(--cb)", border: `1px solid ${c.color}35`, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => setView(c.id)}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color, borderRadius: "14px 14px 0 0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                          <div style={{ width: 42, height: 42, background: c.color + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${c.color}30` }}>{c.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: c.color, fontWeight: 700, letterSpacing: 1 }}>{c.code || "—"}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: "var(--t4)" }}>📚 <span style={{ color: "var(--t2)" }}>{tot}</span></span>
                          <span style={{ fontSize: 12, color: "var(--t4)" }}>✅ <span style={{ color: "#4FC28E" }}>{att}</span></span>
                        </div>
                        <div style={{ background: "var(--ib)", borderRadius: 6, height: 6, overflow: "hidden" }}>
                          <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg,${c.color},${c.color}AA)`, borderRadius: 6, transition: "width .5s" }} />
                        </div>
                        <div style={{ fontSize: 11, color: "var(--t5)", marginTop: 5 }}>{pct}% studied ({std}/{tot})</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {schedule.length > 0 && (
              <>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--t3)" }}>— Weekly Timetable</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {DAYS.map((day) => {
                    const daySlots = byDay[day] || [];
                    return (
                      <div key={day} style={{ background: "var(--cb)", border: "1px solid var(--b1)", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "11px 20px", background: "var(--th)", borderBottom: daySlots.length ? "1px solid var(--b1)" : "none", display: "flex", gap: 12 }}>
                          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#4F8EF7", minWidth: 90 }}>{day}</span>
                          {!daySlots.length && <span style={{ fontSize: 12, color: "var(--t6)" }}>No classes</span>}
                        </div>
                        {daySlots.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "14px 20px" }}>
                            {daySlots.map((s, i) => { const c = gc(s.courseId) || { name: s.courseId, color: "#4A5080", icon: "?" }; return (
                              <div key={i} style={{ background: c.color + "12", border: `1px solid ${c.color}40`, borderRadius: 10, padding: "10px 14px", minWidth: 150, transition: "all .15s" }}>
                                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: c.color, fontWeight: 700 }}>{s.time}</div>
                                <div onClick={() => setView(s.courseId)} style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", margin: "3px 0 6px", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                                  <span className="tag" style={{ background: (TC[s.type] || "#4A5080") + "20", color: TC[s.type] || "#4A5080" }}>{s.type}</span>
                                  {s.room && <span className="tag" style={{ background: "#1A2040", color: "var(--t4)" }}>#{s.room}</span>}
                                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, background: "#0E1E3A", color: "#4F8EF7", padding: "2px 8px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>🔗 Join</a>}
                                </div>
                              </div>
                            ); })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* COURSE DETAIL */}
        {active && (
          <div className="fi">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => { setView("schedule"); setSearch(""); }} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)" }}>← Back</button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, background: active.color + "25", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${active.color}40` }}>{active.icon}</div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: active.color, fontWeight: 700, letterSpacing: 1 }}>{active.code || "—"}</div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700 }}>{active.name}</div>
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button className="btn" onClick={() => { setModal("add"); setForm({ cid: active.id }); }} style={{ background: active.color, color: "#fff" }}>+ Add Lecture</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 26 }}>
              {[{ l: "Total", v: tl(active.id), col: "#4F8EF7" }, { l: "Attended", v: ac(active.id), col: "#4FC28E" }, { l: "Studied", v: sc(active.id), col: "#B44FF7" }, { l: "Progress", v: tl(active.id) ? Math.round((sc(active.id) / tl(active.id)) * 100) + "%" : "0%", col: active.color }].map((s) => (
                <div key={s.l} style={{ background: "var(--cb)", border: `1px solid ${s.col}25`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, color: "var(--t5)", fontFamily: "'JetBrains Mono'", letterSpacing: 1, marginBottom: 6 }}>{s.l.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: s.col }}>{s.v}</div>
                </div>
              ))}
            </div>
            {gl(active.id).length > 0 && (
              <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--t5)" }}>🔍</span>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lectures…" style={{ width: "100%", paddingLeft: 38, height: 40, borderRadius: 10 }} />
                </div>
                {search && <button className="btn" onClick={() => setSearch("")} style={{ background: "var(--ib)", color: "var(--t5)", border: "1px solid var(--b2)", padding: "6px 12px", whiteSpace: "nowrap" }}>✕ Clear</button>}
              </div>
            )}
            {!gl(active.id).length ? (
              <div style={{ background: "var(--cb)", border: "2px dashed var(--b1)", borderRadius: 16, padding: "56px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 46, marginBottom: 14 }}>📖</div>
                <div style={{ color: "var(--t5)", fontSize: 15, marginBottom: 6 }}>No lectures yet</div>
              </div>
            ) : (
              <div style={{ background: "var(--cb)", border: "1px solid var(--b1)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 110px 130px 80px", background: "var(--th)", borderBottom: "1px solid var(--b1)", padding: "12px 20px" }}>
                  {["#", "Lecture", "Attended", "Studied", "Notes", "Del"].map((h) => (
                    <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: "var(--t5)", fontWeight: 700, letterSpacing: 1 }}>{h.toUpperCase()}</div>
                  ))}
                </div>
                {gl(active.id).filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase())).map((lect, idx) => (
                  <div key={lect.id} className="lrow" style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 110px 130px 80px", padding: "13px 20px", borderBottom: "1px solid var(--b1)", alignItems: "center", transition: "background .15s" }}>
                    <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "var(--t6)", fontWeight: 700 }}>{String(idx + 1).padStart(2, "0")}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t2)", marginBottom: 3 }}>{lect.name}</div>
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "var(--t6)" }}>{lect.addedAt}</span>
                        {lect.pdfName && <a href={lect.pdfData} download={lect.pdfName} style={{ fontSize: 11, color: "#4F8EF7", textDecoration: "none", background: "#1A2A4A", padding: "2px 8px", borderRadius: 4 }}>📄 {lect.pdfName.slice(0, 14)}{lect.pdfName.length > 14 ? "…" : ""}</a>}
                        {lect.notes && <span style={{ fontSize: 11, color: "#B44FF7", background: "#2A1A4A", padding: "2px 8px", borderRadius: 4 }}>📝</span>}
                        {(() => { const di = dlInfo(lect.deadline); return di ? <span style={{ fontSize: 11, color: di.color, background: di.bg, padding: "2px 8px", borderRadius: 4, border: "1px solid " + di.color + "40" }}>{di.icon} {di.label}</span> : null; })()}
                      </div>
                    </div>
                    <div>
                      <div onClick={() => tog(active.id, idx, "attended")} style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", background: lect.attended ? "#0E2A1E" : "var(--ib)", border: `1px solid ${lect.attended ? "#4FC28E40" : "var(--b2)"}`, borderRadius: 8, padding: "6px 11px", transition: "all .15s" }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: lect.attended ? "#4FC28E" : "transparent", border: `2px solid ${lect.attended ? "#4FC28E" : "var(--t6)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{lect.attended ? "✓" : ""}</div>
                        <span style={{ fontSize: 12, color: lect.attended ? "#4FC28E" : "var(--t5)", fontWeight: 600 }}>{lect.attended ? "Yes" : "No"}</span>
                      </div>
                    </div>
                    <div>
                      <div onClick={() => tog(active.id, idx, "studied")} style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", background: lect.studied ? "#1E1A3A" : "var(--ib)", border: `1px solid ${lect.studied ? "#B44FF740" : "var(--b2)"}`, borderRadius: 8, padding: "6px 11px", transition: "all .15s" }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: lect.studied ? "#B44FF7" : "transparent", border: `2px solid ${lect.studied ? "#B44FF7" : "var(--t6)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{lect.studied ? "✓" : ""}</div>
                        <span style={{ fontSize: 12, color: lect.studied ? "#B44FF7" : "var(--t5)", fontWeight: 600 }}>{lect.studied ? "Done" : "No"}</span>
                      </div>
                    </div>
                    <div>
                      <button className="btn" onClick={() => { setModal("notes"); setForm({ cid: active.id, li: idx, notes: lect.notes || "" }); }} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", fontSize: 12, padding: "6px 12px" }}>
                        📝 {lect.notes ? "Edit" : "Add"}
                      </button>
                    </div>
                    <div>
                      <button className="btn" onClick={() => dlDel(active.id, idx)} style={{ background: "#2A1018", color: "#F74F4F", border: "1px solid #4A1520", fontSize: 12, padding: "6px 11px" }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {schedule.filter((s) => s.courseId === active.id).length > 0 && (
              <>
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: "var(--t4)", margin: "26px 0 12px" }}>— Schedule</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {schedule.filter((s) => s.courseId === active.id).map((s, i) => (
                    <div key={i} style={{ background: active.color + "12", border: `1px solid ${active.color}35`, borderRadius: 10, padding: "10px 16px" }}>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "var(--t4)", marginBottom: 3 }}>{s.day}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active.color }}>{s.time}</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                        <span className="tag" style={{ background: (TC[s.type] || "#4A5080") + "20", color: TC[s.type] || "#4A5080" }}>{s.type}</span>
                        {s.room && <span className="tag" style={{ background: "#1A2040", color: "var(--t4)" }}>#{s.room}</span>}
                        {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, background: "#0E1E3A", color: "#4F8EF7", padding: "2px 8px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>🔗 Join</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* TIMETABLE MODAL */}
      {showTimetable && (
        <div onClick={() => setShowTimetable(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="fi" style={{ background: "var(--cb)", border: "1px solid var(--b2)", borderRadius: 20, padding: "28px", maxWidth: 780, width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.7)", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700 }}>📅 Weekly Timetable</h2>
                <p style={{ fontSize: 12, color: "var(--t5)", marginTop: 3 }}>Your full week at a glance</p>
              </div>
              <button className="btn" onClick={() => setShowTimetable(false)} style={{ background: "var(--ib)", color: "var(--t4)", border: "1px solid var(--b2)", padding: "7px 13px", fontSize: 13 }}>✕ Close</button>
            </div>
            {schedule.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--t5)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div>No schedule set up yet</div>
                <button className="btn" onClick={() => { setShowTimetable(false); setSetup("schedule"); }} style={{ background: "#1E2A4A", color: "#4F8EF7", border: "1px solid #2E4070", marginTop: 14, padding: "9px 20px" }}>Set Up Schedule →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DAYS.map((day) => {
                  const daySlots = (DAYS.reduce((a, d) => ({ ...a, [d]: schedule.filter((s) => s.day === d) }), {}))[day] || [];
                  return (
                    <div key={day} style={{ background: "var(--ib)", border: "1px solid var(--b1)", borderRadius: 12, overflow: "hidden" }}>
                      <div style={{ padding: "9px 16px", background: "var(--th)", borderBottom: daySlots.length ? "1px solid var(--b1)" : "none", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#4F8EF7", minWidth: 90 }}>{day}</span>
                        {!daySlots.length && <span style={{ fontSize: 11, color: "var(--t6)" }}>No classes</span>}
                      </div>
                      {daySlots.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "12px 16px" }}>
                          {daySlots.map((s, i) => {
                            const c = gc(s.courseId) || { name: s.courseId, color: "#4A5080", icon: "?" };
                            return (
                              <div key={i} style={{ background: c.color + "15", border: `1px solid ${c.color}40`, borderRadius: 10, padding: "10px 14px", minWidth: 160 }}>
                                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: c.color, fontWeight: 700 }}>{s.time}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", margin: "4px 0 2px", display: "flex", alignItems: "center", gap: 6 }}>
                                  <span>{c.icon}</span>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                                </div>
                                {c.code && <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: c.color, marginBottom: 5 }}>{c.code}</div>}
                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                                  <span className="tag" style={{ background: (TC[s.type] || "#4A5080") + "20", color: TC[s.type] || "#4A5080" }}>{s.type}</span>
                                  {s.room && <span className="tag" style={{ background: "#1A2040", color: "var(--t4)" }}>#{s.room}</span>}
                                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, background: "#0E1E3A", color: "#4F8EF7", padding: "2px 8px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>🔗 Join</a>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <SettingsDrawer user={user} dat={dat} courses={courses} schedule={schedule}
          theme={theme} toggleTheme={toggleTheme} settings={settings} setSettings={setSettings}
          onClose={() => setShowSettings(false)} onResetAll={() => { resetAll(); setShowSettings(false); }}
          onManageCourses={() => { setSetup("courses"); setShowSettings(false); }} />
      )}

      {/* MODALS */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="fi" style={{ background: "var(--cb)", border: "1px solid var(--b2)", borderRadius: 18, padding: "28px", maxWidth: 480, width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}>
            {modal === "add" && (
              <>
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>+ Add Lecture</h3>
                <p style={{ fontSize: 13, color: "var(--t5)", marginBottom: 22 }}>{gc(form.cid)?.name}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>LECTURE NAME</label>
                    <input value={form.lname || ""} onChange={(e) => setForm((f) => ({ ...f, lname: e.target.value }))} placeholder="e.g. Fourier Transform" style={{ width: "100%" }} onKeyDown={(e) => e.key === "Enter" && addL()} /></div>
                  <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>ATTACH PDF (optional)</label>
                    <input ref={fRef} type="file" accept=".pdf,image/*" onChange={hf} style={{ display: "none" }} />
                    <button className="btn" onClick={() => fRef.current.click()} style={{ background: "var(--ib)", color: "var(--t3)", border: "1px solid var(--b2)", width: "100%", padding: "10px" }}>{form.pdfName ? "📄 " + form.pdfName : "📎 Choose PDF or Image"}</button></div>
                  <div><label style={{ fontSize: 11, color: "var(--t4)", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: 6 }}>📅 DEADLINE (optional)</label>
                    <input type="date" value={form.deadline || ""} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} style={{ width: "100%", colorScheme: theme === "dark" ? "dark" : "light" }} /></div>
                  <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
                    <button className="btn" onClick={() => { setModal(null); setForm({}); }} style={{ background: "var(--ib)", color: "var(--t4)", border: "1px solid var(--b2)", flex: 1 }}>Cancel</button>
                    <button className="btn" onClick={addL} style={{ background: gc(form.cid)?.color || "#4F8EF7", color: "#fff", flex: 2 }}>Add Lecture</button>
                  </div>
                </div>
              </>
            )}
            {modal === "notes" && (
              <>
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>📝 Notes</h3>
                <p style={{ fontSize: 13, color: "var(--t5)", marginBottom: 18 }}>{gl(form.cid)[form.li]?.name}</p>
                <textarea value={form.notes || ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Write notes here..." rows={8} style={{ width: "100%", resize: "vertical", lineHeight: 1.7 }} />
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button className="btn" onClick={() => setModal(null)} style={{ background: "var(--ib)", color: "var(--t4)", border: "1px solid var(--b2)", flex: 1 }}>Cancel</button>
                  <button className="btn" onClick={sn} style={{ background: "#B44FF7", color: "#fff", flex: 2 }}>Save Notes</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

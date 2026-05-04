import { useState, useEffect, useRef } from "react";
 
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:    "#0d1f3c",
  navyMid: "#1a3560",
  blue:    "#1d4ed8",
  indigo:  "#4f46e5",
  teal:    "#0d9488",
  amber:   "#f59e0b",
  red:     "#ef4444",
  green:   "#22c55e",
  slate:   "#64748b",
  light:   "#f1f5f9",
  white:   "#ffffff",
};
 
// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const LIVE_ROOMS = [
  { id:"r1", subject:"Mathematics",  class:"10-A", teacher:"Mrs. Kavitha R.", avatar:"KR", status:"live",   viewers:12, startedAt:"09:00 AM" },
  { id:"r2", subject:"Physics",      class:"10-A", teacher:"Mr. Arjun Nair",  avatar:"AN", status:"live",   viewers:8,  startedAt:"10:30 AM" },
  { id:"r3", subject:"English",      class:"9-B",  teacher:"Ms. Priya Das",   avatar:"PD", status:"ended",  viewers:0,  startedAt:"08:00 AM" },
];
 
const RECORDED = [
  { id:"v1", subject:"Mathematics",  title:"Quadratic Equations – Part 2", teacher:"Mrs. Kavitha R.", duration:"48:22", date:"Apr 20", thumb:"🔢", views:34 },
  { id:"v2", subject:"Physics",      title:"Laws of Motion – Newton's 3rd", teacher:"Mr. Arjun Nair",  duration:"51:05", date:"Apr 19", thumb:"⚛️", views:28 },
  { id:"v3", subject:"Chemistry",    title:"Periodic Table Deep Dive",     teacher:"Ms. Ritu Mehta",  duration:"39:17", date:"Apr 18", thumb:"🧪", views:41 },
  { id:"v4", subject:"English",      title:"Shakespeare – Macbeth Act III", teacher:"Ms. Priya Das",   duration:"44:50", date:"Apr 17", thumb:"📖", views:19 },
];
 
const STAFF = [
  { id:"u1", name:"Mrs. Kavitha R.",  role:"Math Teacher",    avatar:"KR", online:true  },
  { id:"u2", name:"Mr. Arjun Nair",   role:"Physics Teacher", avatar:"AN", online:true  },
  { id:"u3", name:"Ms. Priya Das",    role:"English Teacher", avatar:"PD", online:false },
  { id:"u4", name:"Mr. Dev Sharma",   role:"Mentor",          avatar:"DS", online:true  },
  { id:"u5", name:"Ms. Ritu Mehta",   role:"Chemistry",       avatar:"RM", online:false },
];
 
const SUBJECTS_TEACHER = [
  { subject:"Mathematics", class:"10-A", nextAt:"Tomorrow 9:00 AM" },
  { subject:"Mathematics", class:"9-B",  nextAt:"Tomorrow 11:00 AM" },
];
 
// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Av({ initials, size=38, bg=C.navyMid, color="#fff" }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:size/2, background:bg,
      color, fontWeight:800, fontSize:size*0.33, display:"flex",
      alignItems:"center", justifyContent:"center", flexShrink:0,
      fontFamily:"'Syne', sans-serif", letterSpacing:-0.5
    }}>{initials}</div>
  );
}
 
function LiveBadge({ pulse=true }) {
  return (
    <span style={{ display:"flex", alignItems:"center", gap:5,
      background:"#dc2626", borderRadius:20, padding:"3px 10px",
      fontSize:10, fontWeight:800, color:"#fff", letterSpacing:1 }}>
      {pulse && <span style={{ width:6, height:6, borderRadius:3, background:"#fff", animation:"livepulse 1s ease infinite" }} />}
      LIVE
    </span>
  );
}
 
function VideoPlayer({ subject, teacher, onClose }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e+1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
 
  return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:2000, display:"flex", flexDirection:"column" }}>
      {/* Fake camera feed */}
      <div style={{ flex:1, position:"relative", background:"linear-gradient(135deg,#0a1628 0%,#0d2244 50%,#0a1628 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {/* Scanline effect */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)", pointerEvents:"none" }} />
        {/* CCTV grid simulation */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, width:"90%", maxWidth:360 }}>
          {["Front View","Side Angle","Board Cam","Overview"].map((label,i) => (
            <div key={i} style={{ aspectRatio:"4/3", background:`rgba(255,255,255,0.04)`, borderRadius:4, border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ fontSize:24 }}>{"📹🎥📸🖥️"[i]}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:9, marginTop:4, fontWeight:600 }}>CAM {i+1} · {label}</div>
              {i===0 && <div style={{ position:"absolute", top:6, left:6 }}><LiveBadge pulse={true} /></div>}
            </div>
          ))}
        </div>
 
        {/* Overlays */}
        <div style={{ position:"absolute", top:14, left:14, right:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ background:"rgba(0,0,0,0.6)", borderRadius:8, padding:"6px 12px", backdropFilter:"blur(8px)" }}>
            <div style={{ color:"#94a3b8", fontSize:9, letterSpacing:1 }}>NOW STREAMING</div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{subject}</div>
            <div style={{ color:"#64748b", fontSize:10 }}>{teacher}</div>
          </div>
          <div style={{ background:"rgba(0,0,0,0.6)", borderRadius:8, padding:"6px 12px", backdropFilter:"blur(8px)", textAlign:"right" }}>
            <div style={{ color:"#f87171", fontWeight:800, fontSize:13, fontFamily:"monospace" }}>{fmt(elapsed)}</div>
            <div style={{ color:"#64748b", fontSize:9 }}>ELAPSED</div>
          </div>
        </div>
 
        {/* Institution watermark */}
        <div style={{ position:"absolute", bottom:14, right:14, background:"rgba(0,0,0,0.5)", borderRadius:8, padding:"6px 12px", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:16 }}>🏫</span>
          <div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:9, fontWeight:700 }}>SPRINGFIELD ACADEMY</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:8 }}>Secure · Encrypted</div>
          </div>
        </div>
      </div>
 
      {/* Controls */}
      <div style={{ background:"#0f172a", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:20 }}>
          {["🔇","📸","⛶"].map((ic,i) => (
            <button key={i} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:10, width:44, height:44, fontSize:18, cursor:"pointer" }}>{ic}</button>
          ))}
        </div>
        <button onClick={onClose} style={{ background:"#dc2626", border:"none", borderRadius:10, padding:"10px 18px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          ✕ Close
        </button>
      </div>
    </div>
  );
}
 
// ─── TEACHER / MENTOR SCREEN ──────────────────────────────────────────────────
function TeacherScreen({ role="teacher" }) {
  const isMentor = role === "mentor";
  const [tab, setTab] = useState(isMentor ? "monitor" : "stream");
  const [streaming, setStreaming] = useState(false);
  const [streamRoom, setStreamRoom] = useState(null);
  const [watching, setWatching] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [source, setSource] = useState("camera"); // camera | cctv | screen
  const [elapsed, setElapsed] = useState(0);
 
  useEffect(() => {
    if (!streaming) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e=>e+1), 1000);
    return () => clearInterval(t);
  }, [streaming]);
 
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
 
  if (watching) return <VideoPlayer subject={watching.subject} teacher={watching.teacher} onClose={() => setWatching(null)} />;
 
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#f8fafc" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${isMentor ? "#0f4c75 0%, #1b262c" : "#0d1f3c 0%, #1d4ed8"} 100%)`, padding:"18px 18px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <Av initials={isMentor?"DS":"KR"} size={44} bg="rgba(255,255,255,0.15)" />
          <div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:1 }}>
              {isMentor ? "MENTOR" : "SUBJECT TEACHER"}
            </div>
            <div style={{ color:"#fff", fontSize:18, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>
              {isMentor ? "Mr. Dev Sharma" : "Mrs. Kavitha R."}
            </div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>
              {isMentor ? "Mentor · Class 10-A" : "Mathematics · 10-A, 9-B"}
            </div>
          </div>
        </div>
 
        <div style={{ display:"flex" }}>
          {(isMentor
            ? [["monitor","👁 Monitor"],["library","🎬 Library"]]
            : [["stream","📡 Go Live"],["library","🎬 Library"],["monitor","👁 Monitor"]]
          ).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"10px 0", border:"none", background:"transparent",
              color: tab===id ? "#fff" : "rgba(255,255,255,0.35)",
              borderBottom:`2px solid ${tab===id ? C.amber : "transparent"}`,
              fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s"
            }}>{label}</button>
          ))}
        </div>
      </div>
 
      <div style={{ flex:1, overflowY:"auto" }}>
 
        {/* ── STREAM TAB (teacher only) ── */}
        {tab === "stream" && !isMentor && (
          <div style={{ padding:16 }}>
            {!streaming ? (
              <>
                <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", marginBottom:14 }}>
                  <div style={{ padding:"16px 18px 12px" }}>
                    <div style={{ fontWeight:800, fontSize:15, color:C.navy, fontFamily:"'Syne',sans-serif" }}>Start Live Class</div>
                    <div style={{ color:C.slate, fontSize:12, marginTop:2 }}>Choose your stream source below</div>
                  </div>
 
                  {/* Source selector */}
                  <div style={{ padding:"0 18px 18px", display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { id:"camera",  icon:"📹", label:"Device Camera",    desc:"Stream from your phone/tablet camera" },
                      { id:"cctv",    icon:"📷", label:"Connect CCTV Feed", desc:"Link classroom CCTV via RTSP/IP address" },
                      { id:"screen",  icon:"🖥️", label:"Screen Share",      desc:"Share your screen or presentation" },
                    ].map(s => (
                      <button key={s.id} onClick={() => setSource(s.id)} style={{
                        display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                        borderRadius:12, border:`2px solid ${source===s.id ? C.blue : "#e2e8f0"}`,
                        background: source===s.id ? "#eff6ff" : "#f8fafc",
                        cursor:"pointer", textAlign:"left", transition:"all 0.2s"
                      }}>
                        <span style={{ fontSize:24 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{s.label}</div>
                          <div style={{ fontSize:11, color:C.slate, marginTop:1 }}>{s.desc}</div>
                        </div>
                        {source===s.id && <span style={{ marginLeft:"auto", color:C.blue, fontWeight:800 }}>✓</span>}
                      </button>
                    ))}
 
                    {source === "cctv" && (
                      <div style={{ background:"#f0f9ff", borderRadius:10, padding:"12px 14px", border:"1px solid #bae6fd" }}>
                        <div style={{ fontSize:12, color:"#0369a1", fontWeight:600, marginBottom:6 }}>RTSP / IP Camera URL</div>
                        <input placeholder="rtsp://192.168.1.101:554/stream" style={{
                          width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #bae6fd",
                          fontSize:12, color:C.navy, outline:"none", boxSizing:"border-box"
                        }} />
                        <div style={{ fontSize:10, color:"#64748b", marginTop:5 }}>Enter your classroom CCTV IP stream address</div>
                      </div>
                    )}
                  </div>
                </div>
 
                {/* Schedule */}
                <div style={{ background:"#fff", borderRadius:16, padding:"14px 18px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.navy, marginBottom:10 }}>My Classes</div>
                  {SUBJECTS_TEACHER.map((c,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: i===0?10:0, paddingBottom: i===0?10:0, borderBottom: i===0?"1px solid #f1f5f9":"none" }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{c.subject} — {c.class}</div>
                        <div style={{ fontSize:11, color:C.slate }}>{c.nextAt}</div>
                      </div>
                      <button onClick={() => { setStreamRoom(c); setStreaming(true); }} style={{
                        background:C.navy, color:"#fff", border:"none", borderRadius:10,
                        padding:"8px 14px", fontWeight:700, fontSize:12, cursor:"pointer"
                      }}>Go Live 📡</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Live control panel */
              <div style={{ animation:"fadeUp 0.4s ease" }}>
                <div style={{ background:C.navy, borderRadius:16, padding:"18px", marginBottom:14, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.02) 20px,rgba(255,255,255,0.02) 40px)" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div>
                      <LiveBadge />
                      <div style={{ color:"#fff", fontWeight:800, fontSize:18, fontFamily:"'Syne',sans-serif", marginTop:8 }}>{streamRoom?.subject}</div>
                      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>Class {streamRoom?.class}</div>
                    </div>
                    <div style={{ background:"rgba(239,68,68,0.15)", borderRadius:10, padding:"8px 14px", border:"1px solid rgba(239,68,68,0.3)", textAlign:"center" }}>
                      <div style={{ color:"#f87171", fontFamily:"monospace", fontSize:22, fontWeight:800 }}>{fmtTime(elapsed)}</div>
                      <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9 }}>RECORDING</div>
                    </div>
                  </div>
 
                  {/* Fake viewfinder */}
                  <div style={{ background:"rgba(0,0,0,0.4)", borderRadius:12, aspectRatio:"16/9", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", border:"1px solid rgba(255,255,255,0.08)", marginBottom:14 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:36 }}>{source==="camera"?"📹":source==="cctv"?"📷":"🖥️"}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:6 }}>
                        {source==="camera" ? "Camera Active" : source==="cctv" ? "CCTV Feed Connected" : "Screen Sharing"}
                      </div>
                    </div>
                    <div style={{ position:"absolute", bottom:10, right:10, display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12 }}>🏫</span>
                      <span style={{ color:"rgba(255,255,255,0.5)", fontSize:9, fontWeight:700 }}>SPRINGFIELD ACADEMY</span>
                    </div>
                    <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.5)", borderRadius:6, padding:"3px 8px" }}>
                      <span style={{ color:"#4ade80", fontSize:10, fontWeight:700 }}>● {14} viewers</span>
                    </div>
                  </div>
 
                  <div style={{ display:"flex", gap:8 }}>
                    {[["🔇","Mute"],["📸","Snapshot"],["💬","Chat"]].map(([ic,lb]) => (
                      <button key={lb} style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"none", borderRadius:10, padding:"10px 0", color:"#fff", fontSize:18, cursor:"pointer" }} title={lb}>{ic}</button>
                    ))}
                    <button onClick={() => { setStreaming(false); setShowUpload(true); }} style={{
                      flex:2, background:"#dc2626", border:"none", borderRadius:10, padding:"10px 0",
                      color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer"
                    }}>■ End & Save</button>
                  </div>
                </div>
              </div>
            )}
 
            {/* Upload modal */}
            {showUpload && (
              <div style={{ background:"#fff", borderRadius:16, padding:"18px", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", animation:"fadeUp 0.3s ease" }}>
                <div style={{ fontWeight:800, fontSize:15, color:C.navy, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>📤 Save Recording</div>
                <div style={{ color:C.slate, fontSize:12, marginBottom:14 }}>Add details before publishing to the video library</div>
                {[
                  { label:"Video Title", placeholder:"e.g. Quadratic Equations – Part 3" },
                  { label:"Description", placeholder:"Brief summary of what was covered..." },
                ].map(f => (
                  <label key={f.label} style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12, fontSize:13, fontWeight:600, color:"#374151" }}>
                    {f.label}
                    <input placeholder={f.placeholder} style={{ padding:"10px 12px", borderRadius:9, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none" }} />
                  </label>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <button onClick={() => setShowUpload(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", color:C.slate, fontWeight:600, cursor:"pointer" }}>Discard</button>
                  <button onClick={() => setShowUpload(false)} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:C.navy, color:"#fff", fontWeight:700, cursor:"pointer" }}>✓ Publish to Library</button>
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* ── MONITOR TAB ── */}
        {tab === "monitor" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.slate, letterSpacing:0.5, textTransform:"uppercase", marginBottom:12 }}>
              Live Classes Now
            </div>
            {LIVE_ROOMS.filter(r=>r.status==="live").map((room,i) => (
              <div key={room.id} style={{
                background:"#fff", borderRadius:16, padding:"14px 16px", marginBottom:12,
                boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", gap:12,
                animation:`fadeUp 0.3s ease ${i*0.07}s both`
              }}>
                <div style={{ position:"relative" }}>
                  <Av initials={room.avatar} size={46} bg={C.navyMid} />
                  <div style={{ position:"absolute", bottom:-2, right:-2, width:12, height:12, borderRadius:6, background:C.green, border:"2px solid #fff" }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                    <span style={{ fontWeight:800, fontSize:14, color:C.navy }}>{room.subject}</span>
                    <LiveBadge pulse={true} />
                  </div>
                  <div style={{ fontSize:12, color:C.slate }}>{room.teacher} · Class {room.class}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
                    Started {room.startedAt} · 👁 {room.viewers} watching
                  </div>
                </div>
                <button onClick={() => setWatching(room)} style={{
                  background:C.navy, color:"#fff", border:"none", borderRadius:10,
                  padding:"8px 14px", fontWeight:700, fontSize:12, cursor:"pointer"
                }}>Watch</button>
              </div>
            ))}
            {isMentor && (
              <div style={{ background:"#f0fdf4", borderRadius:12, padding:"12px 14px", border:"1px solid #bbf7d0", marginTop:4 }}>
                <div style={{ fontSize:12, color:"#166534", fontWeight:700 }}>Mentor Note</div>
                <div style={{ fontSize:12, color:"#15803d", marginTop:3, lineHeight:1.5 }}>
                  As a mentor, you can silently monitor any live class without the teacher or students being notified. Your presence is read-only.
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* ── LIBRARY TAB ── */}
        {tab === "library" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.slate, letterSpacing:0.5, textTransform:"uppercase", marginBottom:12 }}>
              Recorded Classes
            </div>
            {RECORDED.map((v,i) => (
              <div key={v.id} style={{
                background:"#fff", borderRadius:14, marginBottom:12,
                boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden",
                animation:`fadeUp 0.3s ease ${i*0.06}s both`
              }}>
                <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, padding:"18px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:32 }}>{v.thumb}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#fff", fontWeight:700, fontSize:13, lineHeight:1.3 }}>{v.title}</div>
                    <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginTop:3 }}>{v.subject} · {v.date}</div>
                  </div>
                  <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:6, padding:"4px 8px" }}>
                    <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>{v.duration}</span>
                  </div>
                </div>
                <div style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, color:C.slate }}>👁 {v.views} views · {v.teacher}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button style={{ background:"#eff6ff", color:C.blue, border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>▶ Play</button>
                    {!isMentor && <button style={{ background:"#fef2f2", color:"#dc2626", border:"none", borderRadius:8, padding:"6px 10px", fontSize:12, cursor:"pointer" }}>🗑</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─── STUDENT / PARENT SCREEN ──────────────────────────────────────────────────
function StudentScreen() {
  const [tab, setTab] = useState("live");
  const [watching, setWatching] = useState(null);
  const [search, setSearch] = useState("");
  const [parentMode, setParentMode] = useState(false);
 
  if (watching) return <VideoPlayer subject={watching.subject} teacher={watching.teacher} onClose={() => setWatching(null)} />;
 
  const filtered = RECORDED.filter(v =>
    !search || v.subject.toLowerCase().includes(search.toLowerCase()) ||
    v.title.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#f8fafc" }}>
      <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)", padding:"18px 18px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Av initials={parentMode?"PR":"AM"} size={42} bg="rgba(255,255,255,0.12)" />
            <div>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:700, letterSpacing:1 }}>
                {parentMode ? "PARENT" : "STUDENT"}
              </div>
              <div style={{ color:"#fff", fontSize:17, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>
                {parentMode ? "Mrs. Meera Mehta" : "Arjun Mehta"}
              </div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>Class 10-A · Roll 1001</div>
            </div>
          </div>
          <button onClick={() => setParentMode(p=>!p)} style={{
            background: parentMode ? "#f59e0b" : "rgba(255,255,255,0.1)",
            border:"none", borderRadius:20, padding:"7px 12px",
            color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer"
          }}>{parentMode ? "👤 Student" : "👨‍👩‍👦 Parent"}</button>
        </div>
 
        <div style={{ display:"flex" }}>
          {[["live","📡 Live Now"],["library","🎬 Library"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"10px 0", border:"none", background:"transparent",
              color: tab===id ? "#fff" : "rgba(255,255,255,0.3)",
              borderBottom:`2px solid ${tab===id ? C.amber : "transparent"}`,
              fontWeight:700, fontSize:12, cursor:"pointer"
            }}>{label}</button>
          ))}
        </div>
      </div>
 
      <div style={{ flex:1, overflowY:"auto" }}>
        {tab === "live" && (
          <div style={{ padding:16 }}>
            {parentMode && (
              <div style={{ background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)", borderRadius:14, padding:"14px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:28 }}>👁</span>
                <div>
                  <div style={{ color:"#fff", fontWeight:800, fontSize:14, fontFamily:"'Syne',sans-serif" }}>Parent Monitoring</div>
                  <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginTop:2 }}>
                    You can view Arjun's live classes in real-time. All streams are private and encrypted.
                  </div>
                </div>
              </div>
            )}
 
            <div style={{ fontSize:13, fontWeight:700, color:C.slate, letterSpacing:0.5, textTransform:"uppercase", marginBottom:12 }}>
              {LIVE_ROOMS.filter(r=>r.status==="live").length} Classes Live Now
            </div>
 
            {LIVE_ROOMS.map((room,i) => (
              <div key={room.id} style={{
                background:"#fff", borderRadius:16, marginBottom:12, overflow:"hidden",
                boxShadow:"0 2px 10px rgba(0,0,0,0.07)",
                animation:`fadeUp 0.35s ease ${i*0.07}s both`,
                opacity: room.status==="ended" ? 0.6 : 1
              }}>
                <div style={{ background: room.status==="live" ? "linear-gradient(135deg,#0d1f3c,#1d4ed8)" : "#94a3b8", padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ color:"#fff", fontWeight:800, fontSize:15 }}>{room.subject}</div>
                      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:2 }}>
                        {room.teacher} · Class {room.class}
                      </div>
                    </div>
                    {room.status==="live" ? <LiveBadge /> : <span style={{ background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.6)" }}>ENDED</span>}
                  </div>
                </div>
                <div style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, color:C.slate }}>
                    {room.status==="live" ? `Started ${room.startedAt} · 👁 ${room.viewers} watching` : "Class has ended"}
                  </div>
                  {room.status==="live" && (
                    <button onClick={() => setWatching(room)} style={{
                      background:C.navy, color:"#fff", border:"none", borderRadius:10,
                      padding:"8px 16px", fontWeight:700, fontSize:12, cursor:"pointer"
                    }}>{parentMode ? "👁 Monitor" : "▶ Join"}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
 
        {tab === "library" && (
          <div style={{ padding:16 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="🔍  Search by subject or topic..."
              style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", marginBottom:14, boxSizing:"border-box" }} />
 
            {filtered.map((v,i) => (
              <div key={v.id} style={{
                background:"#fff", borderRadius:14, marginBottom:12,
                boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden",
                animation:`fadeUp 0.3s ease ${i*0.06}s both`
              }}>
                <div style={{ background:`linear-gradient(135deg,${C.navy},#163057)`, padding:"16px", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:12, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{v.thumb}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#fff", fontWeight:700, fontSize:13, lineHeight:1.3 }}>{v.title}</div>
                    <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginTop:4 }}>{v.teacher} · {v.date}</div>
                  </div>
                </div>
                <div style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:12, fontSize:12, color:C.slate }}>
                    <span>⏱ {v.duration}</span>
                    <span>👁 {v.views} views</span>
                  </div>
                  <button style={{ background:C.navy, color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontWeight:700, fontSize:12, cursor:"pointer" }}>▶ Watch</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─── HEADMASTER SCREEN ────────────────────────────────────────────────────────
function HeadmasterScreen() {
  const [tab, setTab] = useState("meetings");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState([]);
  const [inMeeting, setInMeeting] = useState(false);
  const [meetTitle, setMeetTitle] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
 
  useEffect(() => {
    if (!inMeeting) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e=>e+1), 1000);
    return () => clearInterval(t);
  }, [inMeeting]);
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
 
  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
 
  if (inMeeting) return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#0a0f1e" }}>
      {/* Meeting header */}
      <div style={{ background:"rgba(255,255,255,0.04)", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🏫</span>
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:13, fontFamily:"'Syne',sans-serif" }}>SPRINGFIELD ACADEMY</div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>Staff Meeting · {meetTitle}</div>
          </div>
        </div>
        <div style={{ background:"rgba(239,68,68,0.15)", borderRadius:8, padding:"5px 10px", border:"1px solid rgba(239,68,68,0.3)" }}>
          <span style={{ color:"#f87171", fontFamily:"monospace", fontWeight:800, fontSize:14 }}>{fmtTime(elapsed)}</span>
        </div>
      </div>
 
      {/* Video grid */}
      <div style={{ flex:1, padding:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, alignContent:"start" }}>
        {/* Headmaster tile */}
        <div style={{ gridColumn:"1/-1", aspectRatio:"16/7", background:"linear-gradient(135deg,#1e3a5f,#0d2244)", borderRadius:14, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid rgba(29,78,216,0.4)" }}>
          {camOff
            ? <Av initials="HM" size={60} bg="rgba(255,255,255,0.1)" />
            : <div style={{ textAlign:"center" }}><div style={{ fontSize:40 }}>📹</div><div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:4 }}>Your Camera</div></div>
          }
          <div style={{ position:"absolute", bottom:10, left:12, background:"rgba(0,0,0,0.6)", borderRadius:6, padding:"3px 10px" }}>
            <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>Headmaster (You) {muted ? "🔇":""}</span>
          </div>
          {/* Logo watermark */}
          <div style={{ position:"absolute", top:10, right:10, display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.4)", borderRadius:8, padding:"5px 10px" }}>
            <span style={{ fontSize:14 }}>🏫</span>
            <span style={{ color:"rgba(255,255,255,0.7)", fontSize:9, fontWeight:800, letterSpacing:0.5 }}>SPRINGFIELD ACADEMY</span>
          </div>
        </div>
 
        {/* Staff tiles */}
        {STAFF.filter(s => selected.includes(s.id)).map((s,i) => (
          <div key={s.id} style={{ aspectRatio:"4/3", background:"linear-gradient(135deg,#1a2744,#0d1f3c)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ textAlign:"center" }}>
              <Av initials={s.avatar} size={44} bg="rgba(255,255,255,0.1)" />
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, marginTop:6 }}>{s.name.split(" ")[1]}</div>
            </div>
            {/* per-tile logo */}
            <div style={{ position:"absolute", top:6, right:6, opacity:0.4 }}>
              <span style={{ fontSize:10 }}>🏫</span>
            </div>
            <div style={{ position:"absolute", bottom:6, left:8, background:"rgba(0,0,0,0.5)", borderRadius:4, padding:"2px 6px" }}>
              <span style={{ color:"#fff", fontSize:9, fontWeight:700 }}>{s.name.split(" ")[0]} {s.name.split(" ")[1]}</span>
            </div>
          </div>
        ))}
      </div>
 
      {/* Controls */}
      <div style={{ background:"rgba(255,255,255,0.04)", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", gap:10 }}>
          {[
            { ic: muted?"🔇":"🎤", action:()=>setMuted(m=>!m), active:!muted },
            { ic: camOff?"📵":"📹", action:()=>setCamOff(c=>!c), active:!camOff },
            { ic:"💬", action:()=>{}, active:true },
            { ic:"📋", action:()=>{}, active:true },
          ].map((b,i) => (
            <button key={i} onClick={b.action} style={{
              width:44, height:44, borderRadius:12, border:"none",
              background: b.active ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.2)",
              fontSize:18, cursor:"pointer"
            }}>{b.ic}</button>
          ))}
        </div>
        <button onClick={() => setInMeeting(false)} style={{ background:"#dc2626", border:"none", borderRadius:12, padding:"10px 20px", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer" }}>
          ✕ End Meeting
        </button>
      </div>
    </div>
  );
 
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#f8fafc" }}>
      <div style={{ background:`linear-gradient(135deg,#0d1f3c 0%,#1a3560 100%)`, padding:"18px 18px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Av initials="HM" size={44} bg="rgba(255,255,255,0.15)" />
            <div>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:700, letterSpacing:1 }}>HEADMASTER</div>
              <div style={{ color:"#fff", fontSize:18, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>Dr. S. Krishnamurthy</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>Springfield Academy</div>
            </div>
          </div>
          <button onClick={() => setShowNew(true)} style={{ background:C.amber, color:"#fff", border:"none", borderRadius:22, padding:"9px 16px", fontWeight:800, fontSize:12, cursor:"pointer" }}>
            + New Meeting
          </button>
        </div>
        <div style={{ display:"flex" }}>
          {[["meetings","📞 Meetings"],["monitor","👁 Live Monitor"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"10px 0", border:"none", background:"transparent",
              color: tab===id ? "#fff" : "rgba(255,255,255,0.3)",
              borderBottom:`2px solid ${tab===id ? C.amber : "transparent"}`,
              fontWeight:700, fontSize:12, cursor:"pointer"
            }}>{label}</button>
          ))}
        </div>
      </div>
 
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {tab === "meetings" && (
          <>
            <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight:800, fontSize:14, color:C.navy, fontFamily:"'Syne',sans-serif", marginBottom:10 }}>Staff Online Now</div>
              {STAFF.map((s,i) => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom: i<STAFF.length-1?10:0, paddingBottom: i<STAFF.length-1?10:0, borderBottom: i<STAFF.length-1?"1px solid #f1f5f9":"none" }}>
                  <div style={{ position:"relative" }}>
                    <Av initials={s.avatar} size={36} />
                    <div style={{ position:"absolute", bottom:-1, right:-1, width:10, height:10, borderRadius:5, background:s.online?C.green:"#94a3b8", border:"2px solid #fff" }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{s.name}</div>
                    <div style={{ fontSize:11, color:C.slate }}>{s.role}</div>
                  </div>
                  <button style={{ background:s.online?"#eff6ff":"#f1f5f9", color:s.online?C.blue:C.slate, border:"none", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:s.online?"pointer":"default" }}>
                    {s.online ? "📞 Call" : "Offline"}
                  </button>
                </div>
              ))}
            </div>
 
            <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight:800, fontSize:14, color:C.navy, fontFamily:"'Syne',sans-serif", marginBottom:10 }}>Recent Meetings</div>
              {[
                { title:"Monthly Review",      date:"Apr 18", participants:4, duration:"42 min" },
                { title:"Exam Planning",        date:"Apr 12", participants:6, duration:"1h 05 min" },
                { title:"1-on-1: Mrs. Kavitha", date:"Apr 08", participants:1, duration:"18 min" },
              ].map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: i<2?12:0, paddingBottom: i<2?12:0, borderBottom: i<2?"1px solid #f1f5f9":"none" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{m.title}</div>
                    <div style={{ fontSize:11, color:C.slate, marginTop:2 }}>{m.date} · {m.participants+1} participants · {m.duration}</div>
                  </div>
                  <button style={{ background:"#f1f5f9", color:C.slate, border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>▶ View</button>
                </div>
              ))}
            </div>
          </>
        )}
 
        {tab === "monitor" && (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:C.slate, letterSpacing:0.5, textTransform:"uppercase", marginBottom:12 }}>All Live Classes</div>
            {LIVE_ROOMS.map((room,i) => (
              <div key={room.id} style={{ background:"#fff", borderRadius:14, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", animation:`fadeUp 0.3s ease ${i*0.07}s both` }}>
                <div style={{ background: room.status==="live" ? `linear-gradient(135deg,${C.navy},${C.navyMid})` : "#94a3b8", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ color:"#fff", fontWeight:800, fontSize:14 }}>{room.subject}</div>
                    <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginTop:2 }}>{room.teacher} · {room.class}</div>
                  </div>
                  {room.status==="live" ? <LiveBadge /> : <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:600 }}>Ended</span>}
                </div>
                <div style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:C.slate }}>👁 {room.viewers || 0} viewers · {room.startedAt}</span>
                  {room.status==="live" && <button style={{ background:C.navy, color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer" }}>Monitor</button>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
 
      {/* New Meeting Modal */}
      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:430, padding:"24px 20px 32px", animation:"slideUp 0.3s ease" }}>
            <div style={{ fontWeight:800, fontSize:18, color:C.navy, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>New Staff Meeting</div>
            <div style={{ color:C.slate, fontSize:13, marginBottom:16 }}>Select participants. Institution logo will appear on all tiles.</div>
 
            <input value={meetTitle} onChange={e=>setMeetTitle(e.target.value)} placeholder="Meeting title (e.g. Monthly Review)"
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", marginBottom:14, boxSizing:"border-box" }} />
 
            <div style={{ fontWeight:700, fontSize:13, color:C.navy, marginBottom:10 }}>Select Participants</div>
            {STAFF.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)} style={{
                display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, marginBottom:8,
                background: selected.includes(s.id) ? "#eff6ff" : "#f8fafc",
                border:`1.5px solid ${selected.includes(s.id) ? C.blue : "#e2e8f0"}`,
                cursor:"pointer", transition:"all 0.15s"
              }}>
                <div style={{ position:"relative" }}>
                  <Av initials={s.avatar} size={36} />
                  <div style={{ position:"absolute", bottom:-1, right:-1, width:10, height:10, borderRadius:5, background:s.online?C.green:"#94a3b8", border:"2px solid #fff" }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{s.name}</div>
                  <div style={{ fontSize:11, color:C.slate }}>{s.role} · {s.online?"Online":"Offline"}</div>
                </div>
                <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${selected.includes(s.id)?C.blue:"#cbd5e1"}`, background:selected.includes(s.id)?C.blue:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {selected.includes(s.id) && <span style={{ color:"#fff", fontSize:13, fontWeight:800 }}>✓</span>}
                </div>
              </div>
            ))}
 
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={() => { setShowNew(false); setSelected([]); }} style={{ flex:1, padding:"13px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", color:C.slate, fontWeight:700, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => { setShowNew(false); setInMeeting(true); }} disabled={selected.length===0 || !meetTitle} style={{
                flex:2, padding:"13px", borderRadius:12, border:"none",
                background: selected.length>0 && meetTitle ? C.navy : "#e2e8f0",
                color: selected.length>0 && meetTitle ? "#fff" : "#94a3b8",
                fontWeight:800, cursor: selected.length>0 && meetTitle ? "pointer":"default", fontSize:14
              }}>🏫 Start Meeting ({selected.length+1})</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState("teacher");
 
  const screens = {
    teacher:  <TeacherScreen role="teacher" />,
    mentor:   <TeacherScreen role="mentor" />,
    student:  <StudentScreen />,
    headmaster: <HeadmasterScreen />,
  };
 
  const roles = [
    ["teacher","👩‍🏫","Teacher"],
    ["mentor","🧑‍💼","Mentor"],
    ["student","👨‍🎓","Student"],
    ["headmaster","👔","Head"],
  ];
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; font-family:'DM Sans',sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        select,input{font-family:'DM Sans',sans-serif}
        button:active{transform:scale(0.97)}
      `}</style>
 
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:430, margin:"0 auto", background:"#fff", overflow:"hidden" }}>
        {/* Role switcher */}
        <div style={{ background:"#0a0f1e", padding:"8px 12px", display:"flex", gap:5, flexShrink:0, alignItems:"center" }}>
          <div style={{ color:"#334155", fontSize:10, fontWeight:700, letterSpacing:0.5, marginRight:4 }}>ROLE:</div>
          {roles.map(([id,ic,label]) => (
            <button key={id} onClick={() => setRole(id)} style={{
              flex:1, padding:"7px 0", borderRadius:8, border:"none",
              background: role===id ? C.amber : "rgba(255,255,255,0.06)",
              color: role===id ? "#fff" : "#475569",
              fontWeight:700, fontSize:11, cursor:"pointer", transition:"all 0.2s"
            }}>{ic} {label}</button>
          ))}
        </div>
 
        {/* Screen */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {screens[role]}
        </div>
 
        {/* Bottom nav */}
        <div style={{ background:"#fff", borderTop:"1px solid #f1f5f9", padding:"6px 0 4px", display:"flex", flexShrink:0 }}>
          {(role==="headmaster"
            ? [["🏠","Home"],["🎥","Videos"],["👥","Staff"],["⚙️","Settings"]]
            : role==="student"
            ? [["🏠","Home"],["🎥","Videos"],["📅","Schedule"],["👤","Profile"]]
            : [["🏠","Home"],["🎥","Videos"],["👥","Students"],["⚙️","Settings"]]
          ).map(([ic,lb],i) => (
            <div key={lb} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 0", color:i===1?C.navy:"#94a3b8", cursor:"pointer" }}>
              <div style={{ fontSize:18 }}>{ic}</div>
              <div style={{ fontSize:10, fontWeight:i===1?800:400, marginTop:2 }}>{lb}</div>
              {i===1 && <div style={{ width:4,height:4,borderRadius:2,background:C.navy,marginTop:2 }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
import React from "react";
import { jwtDecode } from "jwt-decode"; // Cần cài: npm install jwt-decode
import authApi from "./api/authApi";   // Import API module
import matchApi from "./api/matchApi"; // Import Match API

// --- DỮ LIỆU TĨNH CHO CÂY ĐẤU (BRACKET) ---
const quarterGames = [
  { id: "g1", label: "Bảng A", slots: ["Đội 1", "Đội 2", "Đội 3"] },
  { id: "g2", label: "Bảng B", slots: ["Đội 4", "Đội 5", "Đội 6"] },
  { id: "g3", label: "Bảng C", slots: ["Đội 7", "Đội 8", "Đội 9"] },
  { id: "g4", label: "Bảng D", slots: ["Đội 10", "Đội 11", "Đội 12"] },
];

const semiGames = [
  { id: "g5", label: "Bán kết 1", slots: ["Nhất bảng A", "Nhất bảng B"], connectorHeight: 94 },
  { id: "g6", label: "Bán kết 2", slots: ["Nhất bảng C", "Nhất bảng D"], connectorHeight: 94 },
];

const finalGame = { id: "g7", label: "Chung kết", slots: ["Thắng bán kết 1", "Thắng bán kết 2"], connectorHeight: 188 };

const sectionMatches = {
  g1: { label: "Bảng A" },
  g2: { label: "Bảng B" },
  g3: { label: "Bảng C" },
  g4: { label: "Bảng D" },
  g5: { label: "Bán kết 1" },
  g6: { label: "Bán kết 2" },
  g7: { label: "Chung kết" },
};

const transformMatchesToDays = (matches) => {
  if (!Array.isArray(matches)) return [];

  const grouped = matches.reduce((acc, match) => {
    // Ưu tiên lấy biến date dạng string từ DB, nếu không có mới cắt từ start_time
    const dateKey = match.date || (match.start_time ? match.start_time.split("T")[0] : "unknown");
    if (!acc[dateKey]) acc[dateKey] = [];
    
    acc[dateKey].push({
      id: match.id,
      competition: match.competition,
      status: match.is_locked ? "ft" : (match.status || "upcoming"),
      
      // QUAN TRỌNG: Ưu tiên hiển thị chuỗi kickoff từ DB (VD: "05:00")
      // Nếu không có mới phải format từ start_time
      kickoff: match.kickoff || (match.start_time ? new Date(match.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""),
      
      // Giữ nguyên các thông tin khác
      date: dateKey, // Lưu lại dateKey để dùng cho form sửa
      start_time: match.start_time,
      home: { name: match.team_a, score: match.score_a, logo: match.team_a_logo, color: match.team_a_color },
      away: { name: match.team_b, score: match.score_b, logo: match.team_b_logo, color: match.team_b_color },
      predictions: match.predictions || [] 
    });
    return acc;
  }, {});

  return Object.keys(grouped).sort().map(dateKey => {
     // ... (giữ nguyên logic format label ngày)
     const dateObj = new Date(dateKey);
     const label = dateObj.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
     return { id: dateKey, label: label, matches: grouped[dateKey] };
  });
};

// --- APP MAIN COMPONENT ---
export default function App() {
  const [showAuth, setShowAuth] = React.useState(false);
  const [view, setView] = React.useState("bracket");
  const [matchDays, setMatchDays] = React.useState([]); // Bắt đầu với mảng rỗng
  const [selectedSection, setSelectedSection] = React.useState(null);
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const isAdmin = user?.role === "admin";

  // 1. Fetch dữ liệu trận đấu khi load trang
  React.useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matches = await matchApi.getAllMatches();
        const uiData = transformMatchesToDays(matches);
        setMatchDays(uiData);
      } catch (error) {
        console.error("Failed to load matches:", error);
      }
    };
    fetchMatches();
  }, []);

  // 2. Kết nối WebSocket để nhận điểm số Realtime
  React.useEffect(() => {
    // Lưu ý: Port 8000 là port của FastAPI
    const ws = new WebSocket("ws://localhost:8000/ws/live-scores");

    ws.onopen = () => console.log("Connected to WebSocket Live Scores");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "SCORE_UPDATE") {
          const { match_id, score_a, score_b } = msg.data;
          
          // Update state deep inside matchDays
          setMatchDays(prevDays => prevDays.map(day => ({
            ...day,
            matches: day.matches.map(match => {
              if (match.id === match_id) {
                return {
                  ...match,
                  home: { ...match.home, score: score_a },
                  away: { ...match.away, score: score_b },
                  status: "live" // Tự động chuyển trạng thái sang live nếu có điểm
                };
              }
              return match;
            })
          })));

          // Nếu đang mở modal chi tiết trận đấu đó thì update luôn
          setSelectedMatch(prev => {
            if (prev && prev.id === match_id) {
               return {
                 ...prev,
                 home: { ...prev.home, score: score_a },
                 away: { ...prev.away, score: score_b }
               };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("WS Error:", err);
      }
    };

    return () => ws.close();
  }, []);

  // 3. Check login state
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          return;
        }
        setUser({
          studentId: decoded.sub,
          role: decoded.role,
          fullName: decoded.sub, 
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleSectionSelect = (sectionId) => {
    setSelectedSection(sectionId);
    setView("results");
  };

  const handleUpdateDay = (dayId, updates) => {
    setMatchDays((prev) => prev.map((day) => (day.id === dayId ? { ...day, ...updates } : day)));
  };

  // Logic thêm trận mới (chỉ update UI tạm thời, thực tế API đã gọi xong mới reload list)
  const handleAddMatch = (dayId, match) => {
     // Nên reload lại toàn bộ list từ API để đảm bảo đúng sort
     matchApi.getAllMatches().then(res => setMatchDays(transformMatchesToDays(res)));
  };

  const handleUpdateMatch = (dayId, matchId, updates) => {
    // Gọi API lấy lại toàn bộ danh sách để đảm bảo sort đúng và giờ đúng
    matchApi.getAllMatches().then(res => setMatchDays(transformMatchesToDays(res)));
  };

  const handleDeleteMatch = (dayId, matchId) => {
    setMatchDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, matches: (day.matches || []).filter((m) => m.id !== matchId) } : day))
    );
  };

  const handleAuthSubmit = async (payload, mode) => {
    try {
      if (mode === "login") {
        const data = await authApi.login({
          msv: payload.studentId,
          password: payload.password
        });
        localStorage.setItem("token", data.access_token);
        const decoded = jwtDecode(data.access_token);
        const userInfo = {
          studentId: decoded.sub,
          role: decoded.role,
          fullName: decoded.sub, 
        };

        setUser(userInfo);
        setShowAuth(false);
        if (decoded.role === "admin") setView("admin");
        alert(`Xin chào ${userInfo.studentId}, đăng nhập thành công!`);

      } else {
        await authApi.register({
          msv: payload.studentId,
          full_name: payload.fullName,
          phone: payload.phone,
          password: payload.password
        });
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        return true; 
      }
    } catch (error) {
      console.error("Auth failed:", error);
      const msg = error.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.";
      alert("Lỗi: " + msg);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSelectedMatch(null);
    setView("bracket");
  };

  const selectedLabel = selectedSection ? sectionMatches[selectedSection]?.label : null;

  return (
    <div className="app">
      <div className="backdrop" />
      <main className="shell">
        <header className="hero">
          <div className="hero-main">
            <div className="badge">
              <div className="badge-ball" />
              <div className="badge-text">
                <span className="badge-title">FOOTBALL</span>
                <span className="badge-sub">TOURNAMENT</span>
              </div>
            </div>
            <div className="hero-text">
              <h2>BTEC FOOTBALL CHAMPIONSHIP 2025</h2>
            </div>
          </div>
        </header>

        <div className="page-tabs">
          <button className={`page-tab ${view === "bracket" ? "is-active" : ""}`} type="button" onClick={() => setView("bracket")}>
            Cây đấu
          </button>
          <button className={`page-tab ${view === "results" ? "is-active" : ""}`} type="button" onClick={() => setView("results")}>
            Kết quả
          </button>
          {isAdmin && (
            <button className={`page-tab ${view === "admin" ? "is-active" : ""}`} type="button" onClick={() => setView("admin")}>
              Admin
            </button>
          )}
        </div>

        <div className="user-strip">
          {user ? (
            <>
              <span className="muted">
                Đang đăng nhập: <strong>{user.fullName || user.studentId}</strong>
                {isAdmin && " (Admin)"}
              </span>
              {isAdmin && view !== "admin" && (
                <button className="primary-btn ghost-btn" type="button" onClick={() => setView("admin")}>
                  Vào trang Admin
                </button>
              )}
              <button className="primary-btn ghost-btn" type="button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <button className="primary-btn ghost-btn" type="button" onClick={() => setShowAuth(true)}>
              Đăng nhập
            </button>
          )}
        </div>

        {view === "bracket" ? (
          <section className="section-block section-block--bare">
            <BracketBoard onSectionSelect={handleSectionSelect} />
          </section>
        ) : view === "results" ? (
          <section className="section-block">
            <ResultsFeed
              matchDays={matchDays}
              selectedLabel={selectedLabel}
              onBack={() => setView("bracket")}
              onSelectMatch={setSelectedMatch}
              onOpenAuth={() => setShowAuth(true)}
            />
          </section>
        ) : (
          <section className="section-block">
            <AdminPanel
              matchDays={matchDays}
              onUpdateDay={handleUpdateDay}
              onAddMatch={handleAddMatch}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
            />
          </section>
        )}

        <AuthModal 
          open={showAuth} 
          onClose={() => setShowAuth(false)} 
          onAuthSubmit={handleAuthSubmit} 
        />
        {view === "bracket" && <BottomCta onClick={() => setView("results")} />}
        {selectedMatch && <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function AuthModal({ open, onClose, onAuthSubmit }) {
  const [view, setView] = React.useState("login");

  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  React.useEffect(() => { if (open) setView("login"); }, [open]);

  const handleFormSubmit = async (formData) => {
    const success = await onAuthSubmit(formData, view);
    if (success && view === "register") setView("login");
  };

  if (!open) return null;

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <div className="auth-modal__head">
          <div><p className="eyebrow">Football tournament</p><h2>{view === "login" ? "Đăng nhập" : "Đăng ký"}</h2></div>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>
        <section className="auth auth--single">
          {view === "login" ? (
            <div className="auth-card">
              <div className="auth-card__head"><p className="eyebrow">Truy cập</p><h3>Đăng nhập</h3></div>
              <AuthForm mode="login" onSubmit={handleFormSubmit} />
              <div className="auth-foot"><span>Chưa có tài khoản? <button type="button" className="link-button" onClick={() => setView("register")}>Đăng ký</button></span></div>
            </div>
          ) : (
            <div className="auth-card auth-card--accent">
              <div className="auth-card__head"><p className="eyebrow">Tạo tài khoản</p><h3>Đăng ký</h3></div>
              <AuthForm mode="register" onSubmit={handleFormSubmit} />
              <div className="auth-foot"><span>Đã có tài khoản? <button type="button" className="link-button" onClick={() => setView("login")}>Đăng nhập</button></span></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AuthForm({ mode, onSubmit }) {
  const isLogin = mode === "login";
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentId = (formData.get("studentId") || "").toString().trim();
    const password = (formData.get("password") || "").toString().trim();
    const fullName = !isLogin ? (formData.get("fullName") || "").toString().trim() : "";
    const phone = !isLogin ? (formData.get("phone") || "").toString().trim() : "";

    if (!studentId || !password) return alert("Vui lòng nhập MSV và mật khẩu");
    onSubmit?.({ studentId, fullName, phone, password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>MSV</span>
        <input type="text" name="studentId" className="uppercase-input" placeholder="VD: BH01234" required onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }} />
      </label>
      {!isLogin && (
        <>
          <label className="field"><span>Họ và tên</span><input type="text" name="fullName" required /></label>
          <label className="field"><span>Số điện thoại</span><input type="tel" name="phone" required /></label>
        </>
      )}
      <label className="field"><span>{isLogin ? "Mật khẩu" : "Tạo mật khẩu"}</span><input type="password" name="password" required /></label>
      <button className="primary-btn" type="submit">{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</button>
    </form>
  );
}

function BracketBoard({ onSectionSelect }) {
  return (
    <section className="board">
      <div className="board-viewport">
        <div className="round-anchor round-anchor--qf" />
        <div className="round-anchor round-anchor--semi" />
        <div className="round-anchor round-anchor--final" />
        <div className="round-anchor round-anchor--champ" />
        <div className="board-grid">
          <GameCard game={quarterGames[0]} variant="quarter" extraClass="pos-q1" onClick={() => onSectionSelect("g1")} />
          <GameCard game={quarterGames[1]} variant="quarter" extraClass="pos-q2" onClick={() => onSectionSelect("g2")} />
          <GameCard game={quarterGames[2]} variant="quarter" extraClass="pos-q3" onClick={() => onSectionSelect("g3")} />
          <GameCard game={quarterGames[3]} variant="quarter" extraClass="pos-q4" onClick={() => onSectionSelect("g4")} />
          <GameCard game={semiGames[0]} variant="semi" extraClass="pos-s1" onClick={() => onSectionSelect("g5")} />
          <GameCard game={semiGames[1]} variant="semi" extraClass="pos-s2" onClick={() => onSectionSelect("g6")} />
          <GameCard game={finalGame} variant="final" extraClass="pos-f" onClick={() => onSectionSelect("g7")} />
          <ChampionCard extraClass="pos-champion" />
          <Connector className="connector connector-q12" mode="q" />
          <Connector className="connector connector-q34" mode="q" />
          <Connector className="connector connector-semis" mode="semi" />
          <Connector className="connector connector-final" mode="final" />
          <div className="round-label round-label--qf">Vòng bảng</div>
          <div className="round-label round-label--semi">Bán kết</div>
          <div className="round-label round-label--final">Chung kết</div>
          <div className="round-label round-label--champ">Vô địch</div>
        </div>
      </div>
    </section>
  );
}

function ResultsFeed({ matchDays = [], selectedLabel, onBack, onSelectMatch, onOpenAuth }) {
  return (
    <section className="results">
      <div className="results-header">
        <div><p className="eyebrow">Trang kết quả</p><h2>Tất cả trận đấu</h2>{selectedLabel && <p className="muted">Đang xem nhánh: {selectedLabel}</p>}</div>
        <div className="results-actions">
          <button className="primary-btn ghost-btn" onClick={() => onBack()}>Quay lại cây</button>
          <button className="primary-btn ghost-btn" onClick={() => onOpenAuth?.()}>Đăng nhập</button>
        </div>
      </div>
      <div className="match-days">
        {matchDays.map((day) => (
          <article key={day.id} className="match-day">
            <div className="match-day__heading">{day.label}</div>
            <div className="match-list">
              {(day.matches || []).map((match) => (
                <MatchCard key={match.id} match={match} onSelect={() => onSelectMatch?.(match)} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminPanel({ matchDays = [], onUpdateDay, onAddMatch, onUpdateMatch, onDeleteMatch }) {
  
  // Hàm xử lý gọi API chung để không phải reload trang
  const handleApiAction = async (promise, onSuccess) => {
    try {
      await promise;
      // Gọi callback để App cha tự fetch lại dữ liệu mới nhất
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <section className="admin-panel">
      <div className="results-header"><div><p className="eyebrow">Trang admin</p><h2>Quản lý trận đấu</h2></div></div>

      <div className="admin-grid">
        {/* --- FORM THÊM TRẬN --- */}
        <div className="admin-card admin-card--wide">
          <div className="admin-card__head"><h4>Thêm trận mới</h4></div>
          <AdminMatchForm
            submitLabel="Thêm trận"
            onSubmit={(payload) => {
              import('./api/adminApi').then(mod => {
                 handleApiAction(
                   mod.default.createMatch(payload),
                   () => {
                      alert("Đã thêm trận mới!");
                      // Gọi onAddMatch với tham số rỗng để App tự reload toàn bộ
                      onAddMatch?.(); 
                   }
                 );
              });
            }}
          />
        </div>

        {/* --- DANH SÁCH TRẬN ĐẤU (Hiện tất cả các ngày) --- */}
        {matchDays.length > 0 ? (
          <div className="admin-match-list">
             <div className="admin-card__head"><h3>Danh sách trận</h3></div>
             
             {matchDays.map((day) => (
                <div key={day.id} style={{marginBottom: '20px'}}>
                  <h5 className="eyebrow" style={{margin: "10px 0", color: "#5bed9f", borderBottom: "1px solid #333"}}>
                    {day.label}
                  </h5>
                  
                  {(day.matches || []).map((match) => (
                    <AdminMatchCard
                      key={match.id}
                      match={match}
                      // SỰ KIỆN UPDATE
                      onUpdate={(payload) => {
                         import('./api/adminApi').then(mod => {
                            handleApiAction(
                              mod.default.updateMatch(match.id, payload),
                              () => {
                                 // Update xong gọi callback để load lại list
                                 onUpdateMatch?.(day.id, match.id, payload);
                              }
                            );
                         });
                      }}
                      // SỰ KIỆN DELETE
                      onDelete={() => {
                        if (!window.confirm(`Xóa trận ${match.home.name} vs ${match.away.name}?`)) return;
                        
                        import('./api/adminApi').then(mod => {
                            handleApiAction(
                              mod.default.deleteMatch(match.id),
                              () => {
                                 // Xóa xong gọi callback load lại list
                                 onDeleteMatch?.(day.id, match.id);
                              }
                            );
                        });
                      }}
                    />
                  ))}
                </div>
             ))}
          </div>
        ) : <p className="muted">Chưa có trận đấu nào.</p>}
      </div>
    </section>
  );
}

function AdminMatchCard({ match, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const statusLabel = match.status === "live" ? "Đang diễn ra" : match.status === "ft" ? "Kết thúc" : "Sắp diễn ra";

  return (
    <div className="admin-card admin-card--match">
      <div className="admin-card__head">
        <div>
          <p className="eyebrow">{match.competition}</p>
          <strong>{match.home?.name} vs {match.away?.name}</strong>
          <div className="muted"><span>{statusLabel}</span> • {match.kickoff}</div>
        </div>
        <div className="admin-card__actions">
          <button className="primary-btn ghost-btn" onClick={() => setIsEditing((v) => !v)}>{isEditing ? "Huỷ" : "Sửa"}</button>
          <button className="primary-btn" onClick={onDelete}>Xóa</button>
        </div>
      </div>

      {isEditing ? (
        <AdminMatchForm
          initialMatch={match}
          submitLabel="Lưu thay đổi"
          onSubmit={(payload) => {
            onUpdate?.(payload);
            setIsEditing(false);
          }}
        />
      ) : (
        <div className="admin-match-summary">
          <div className="admin-team">
            <span className={`mini-badge ${match.home?.logo ? "mini-badge--logo" : ""}`} style={{ background: match.home?.logo ? "transparent" : match.home?.color || "#5bed9f" }}>
              {match.home?.logo ? <img className="badge-img" src={match.home.logo} alt="" /> : (match.home?.name?.[0])}
            </span>
            <span>{match.home?.name}</span>
          </div>
          <div className="admin-score"><span>{match.home?.score ?? "-"}</span><span className="dash">-</span><span>{match.away?.score ?? "-"}</span></div>
          <div className="admin-team">
            <span className={`mini-badge ${match.away?.logo ? "mini-badge--logo" : ""}`} style={{ background: match.away?.logo ? "transparent" : match.away?.color || "#e85c5c" }}>
              {match.away?.logo ? <img className="badge-img" src={match.away.logo} alt="" /> : (match.away?.name?.[0])}
            </span>
            <span>{match.away?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMatchForm({ initialMatch, submitLabel = "Lưu", onSubmit }) {
  const emptyForm = {
    competition: "", status: "upcoming", date: "", kickoff: "", minute: "",
    homeName: "", homeLogo: "", homeScore: "", awayName: "", awayLogo: "", awayScore: "",
  };

  // Trong component AdminMatchForm
  const toFormState = (match) => ({
    competition: match?.competition || "",
    status: match?.status || "upcoming",
    
    // Lấy thẳng chuỗi từ match, không cần convert Date nữa
    date: match?.date || "", 
    kickoff: match?.kickoff || "", 
    
    homeName: match?.home?.name || "", homeLogo: match?.home?.logo || "", homeScore: match?.home?.score ?? "",
    awayName: match?.away?.name || "", awayLogo: match?.away?.logo || "", awayScore: match?.away?.score ?? "",
  });

  const [form, setForm] = React.useState(toFormState(initialMatch) || emptyForm);
  React.useEffect(() => { setForm(toFormState(initialMatch)); }, [initialMatch]);

  const parseScore = (val) => (val === "" || val == null ? undefined : Number(val));
  const bind = (field) => ({ value: form[field], onChange: (e) => setForm((prev) => ({ ...prev, [field]: e.target.value })) });
  
  const handleLogoChange = (field) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setForm((prev) => ({ ...prev, [field]: reader.result || "" }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: initialMatch?.id,
      competition: form.competition || "Friendly",
      status: form.status,
      date: form.date, // Gửi ngày
      kickoff: form.kickoff, // Gửi giờ
      home: { name: form.homeName, logo: form.homeLogo, score: parseScore(form.homeScore) },
      away: { name: form.awayName, logo: form.awayLogo, score: parseScore(form.awayScore) },
    };
    onSubmit?.(payload);
    if (!initialMatch) setForm(emptyForm);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-row">
        <label className="field"><span>Giải đấu</span><input type="text" {...bind("competition")} /></label>
        <label className="field"><span>Ngày thi đấu</span><input type="date" {...bind("date")} required /></label>
        <label className="field"><span>Giờ (HH:mm)</span><input type="time" {...bind("kickoff")} required /></label>
        <label className="field">
          <span>Trạng thái</span>
          <select className="field-select" {...bind("status")}>
            <option value="upcoming">Sắp diễn ra</option><option value="live">Đang diễn ra</option><option value="ft">Kết thúc</option>
          </select>
        </label>
      </div>

      <div className="admin-form-row admin-form-row--teams">
        <div className="admin-team-col">
          <p className="eyebrow">Đội nhà</p>
          <label className="field"><span>Tên</span><input type="text" {...bind("homeName")} /></label>
          <div className="logo-upload">
            <label className="field"><span>Logo</span><input type="file" accept="image/*" onChange={handleLogoChange("homeLogo")} /></label>
            {form.homeLogo && <div className="logo-preview"><img src={form.homeLogo} alt="" /></div>}
          </div>
          <label className="field"><span>Tỷ số</span><input type="number" {...bind("homeScore")} /></label>
        </div>
        <div className="admin-team-col">
          <p className="eyebrow">Đội khách</p>
          <label className="field"><span>Tên</span><input type="text" {...bind("awayName")} /></label>
          <div className="logo-upload">
            <label className="field"><span>Logo</span><input type="file" accept="image/*" onChange={handleLogoChange("awayLogo")} /></label>
            {form.awayLogo && <div className="logo-preview"><img src={form.awayLogo} alt="" /></div>}
          </div>
          <label className="field"><span>Tỷ số</span><input type="number" {...bind("awayScore")} /></label>
        </div>
      </div>
      <div className="admin-actions-row"><button className="primary-btn" type="submit">{submitLabel}</button></div>
    </form>
  );
}

function GameCard({ game, variant, extraClass, onClick }) {
  return (
    <div className={`game-card game-card--${variant} ${extraClass || ""} ${onClick ? "game-card--link" : ""}`} onClick={onClick}>
      <div className="game-label">{game.label}</div>
      {game.slots.map((slot, i) => <div key={i} className="slot"><span>{slot}</span></div>)}
    </div>
  );
}

function ChampionCard({ extraClass }) {
  return (
    <div className={`champion-card ${extraClass || ""}`}>
      <div className="cup-icon"><div className="cup-bowl" /><div className="cup-base" /></div>
      <div className="champion-text"><span className="eyebrow">Champion</span><strong>Waiting...</strong></div>
    </div>
  );
}

function Connector({ className, mode }) {
  // SVG path logic giữ nguyên
  const isSemi = mode === "semi"; const isFinal = mode === "final";
  const viewBox = isSemi ? "0 0 140 400" : isFinal ? "0 0 120 220" : "0 0 140 200";
  let path = isSemi ? "M0 100 C 40 100 40 150 80 200 C 40 250 40 300 0 300 M80 200 C 110 200 125 200 140 200" :
             isFinal ? "M0 110 C 30 110 60 110 120 110" : "M0 50 C 35 50 35 70 70 100 C 35 130 35 150 0 150 M70 100 C 100 100 125 100 140 100";
  return <div className={className}><svg viewBox={viewBox} className="connector-svg" preserveAspectRatio="none"><path className="connector-path" d={path} /></svg></div>;
}

function MatchCard({ match, onSelect }) {
  const statusLabel = match.status === "live" ? `LIVE ${match.minute || ""}` : match.status === "ft" ? "End" : match.kickoff;
  return (
    <article className={`match-card match-card--${match.status} ${onSelect ? "match-card--clickable" : ""}`} onClick={onSelect}>
      <div className="match-meta"><span className="competition">{match.competition}</span>{match.kickoff && <span className="kickoff">{match.kickoff}</span>}</div>
      {match.status !== "ft" && <div className="match-status match-status--center"><StatusPill status={match.status} label={statusLabel} /></div>}
      <div className="match-main">
        <TeamCell team={match.home} />
        <div className="scoreline"><span className="score">{match.home.score ?? "-"}</span><span className="dash">-</span><span className="score">{match.away.score ?? "-"}</span></div>
        <TeamCell team={match.away} align="right" />
      </div>
    </article>
  );
}

function TeamCell({ team, align = "left" }) {
  const hasLogo = Boolean(team.logo);
  return (
    <div className={`team ${align === "right" ? "team--right" : ""}`}>
      <div className={`team-badge ${hasLogo ? "team-badge--logo" : ""}`} style={{ background: hasLogo ? "transparent" : team.color || "rgba(255,255,255,0.06)" }}>
        {hasLogo ? <img className="badge-img" src={team.logo} alt="" /> : <span>{team.name?.[0]}</span>}
      </div>
      <div className="team-name">{team.name}</div>
    </div>
  );
}

function StatusPill({ status, label }) {
  return <span className={`status-pill status-pill--${status}`}>{label}</span>;
}

function MatchDetailModal({ match, onClose }) {
  const [detail, setDetail] = React.useState(null);
  const [homePick, setHomePick] = React.useState("");
  const [awayPick, setAwayPick] = React.useState("");

  React.useEffect(() => {
    if (match?.id) matchApi.getMatchDetail(match.id).then(setDetail).catch(console.error);
  }, [match]);

  const handlePredict = async () => {
    if (!homePick || !awayPick) return alert("Vui lòng nhập tỷ số");
    try {
      await matchApi.predict({ match_id: match.id, score_a: parseInt(homePick), score_b: parseInt(awayPick) });
      alert("Dự đoán thành công!");
      const data = await matchApi.getMatchDetail(match.id);
      setDetail(data);
    } catch (error) { alert(error.response?.data?.detail || "Lỗi dự đoán"); }
  };

  const displayMatch = detail || match; 
  const stats = detail?.stats || { home_percent: 0, draw_percent: 0, away_percent: 0, total: 0 };
  const predictors = detail?.predictors || [];
  const maskName = (name) => name ? name.substring(0, 2) + "***" + name.slice(-2) : "Ẩn danh";

  return (
    <div className="match-detail-backdrop">
      <div className="match-detail">
        <div className="match-detail__head"><div><p className="eyebrow">Chi tiết</p><h3>{displayMatch.team_a} vs {displayMatch.team_b}</h3></div><button className="icon-btn" onClick={onClose}>×</button></div>
        <div className="match-detail__body">
          <div className="match-detail__teams">
             <TeamCell team={{ name: displayMatch.team_a, logo: displayMatch.team_a_logo, color: displayMatch.team_a_color }} />
             <div className="scoreline scoreline--lg"><span className="score">{displayMatch.score_a ?? "-"}</span>-<span className="score">{displayMatch.score_b ?? "-"}</span></div>
             <TeamCell team={{ name: displayMatch.team_b, logo: displayMatch.team_b_logo, color: displayMatch.team_b_color }} align="right" />
          </div>
          <div className="match-detail__events">
             {/* Phần events có thể map từ detail.events nếu có */}
          </div>
          <div className="predict-list">
             <div className="predict-list__head"><p className="eyebrow">Người dự đoán ({stats.total})</p></div>
             <div className="predict-list__body" style={{maxHeight: '120px', overflowY: 'auto'}}>
                {predictors.map((p, i) => <div key={i} className="predict-item"><span>{maskName(p.name)}</span><span className="muted">{p.pick}</span></div>)}
             </div>
             {stats.total > 0 && (
              <div className="predict-summary">
                <div className="predict-bar predict-bar--stack">
                  <div className="predict-segment predict-segment--home" style={{width: `${stats.home_percent}%`}}>{stats.home_percent}%</div>
                  <div className="predict-segment predict-segment--draw" style={{width: `${stats.draw_percent}%`}}>{stats.draw_percent}%</div>
                  <div className="predict-segment predict-segment--away" style={{width: `${stats.away_percent}%`}}>{stats.away_percent}%</div>
                </div>
              </div>
             )}
          </div>
          <div className="predict-input">
             <div className="predict-input__row">
               <div className="predict-team">{displayMatch.team_a}</div>
               <input className="predict-score" type="number" value={homePick} onChange={e => setHomePick(e.target.value)} />
               <span className="predict-input__dash">-</span>
               <input className="predict-score" type="number" value={awayPick} onChange={e => setAwayPick(e.target.value)} />
               <div className="predict-team">{displayMatch.team_b}</div>
             </div>
             <div className="predict-action"><button className="primary-btn predict-btn" onClick={handlePredict} disabled={displayMatch.is_locked}>{displayMatch.is_locked ? "Đã khóa" : "Gửi dự đoán"}</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomCta({ onClick }) {
  return <div className="bottom-cta"><button className="primary-btn bottom-cta__btn" onClick={onClick}>Mở trang kết quả</button></div>;
}
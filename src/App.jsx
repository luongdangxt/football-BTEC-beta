import React from "react";
import { jwtDecode } from "jwt-decode"; // Cần cài: npm install jwt-decode
import authApi from "./api/authApi";   // Import API module
import matchApi from "./api/matchApi"; // Import Match API
import userAdminApi from "./api/userAdminApi";
import logoLeft from "./images/image2.jpg";
import logoCenter from "./images/Logo Bong Da.png";
import logoRight from "./images/image1.jpg";

// Simple breakpoint hook for responsive tweaks
function useIsNarrow(maxWidth = 640) {
  const [isNarrow, setIsNarrow] = React.useState(() => (typeof window !== "undefined" ? window.innerWidth <= maxWidth : false));
  React.useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth <= maxWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [maxWidth]);
  return isNarrow;
}


// --- DỮ LIỆU TĨNH CHO CÂY ĐẤU (BRACKET) ---
const groupColors = {
  A: "#5bed9f",
  B: "#4aa3ff",
  C: "#f5c244",
  D: "#f36c6c",
};

const quarterGames = [
  { id: "g1", label: "Bảng A", slots: ["Đội Văn Bổng", "TD & AE", "The Fix FC"] },
  { id: "g2", label: "Bảng B", slots: ["FC Thanh Triều", "Galacticos", "Lữ Quý Thành Mẫn"] },
  { id: "g3", label: "Bảng C", slots: ["Trẻ Mel", "Max FC", "F+"] },
  { id: "g4", label: "Bảng D", slots: ["Dừa FC", "All Star BTEC", "Melbourne FPI"] },
];
const knockoutQuarterGames = [
  { id: "qf1", label: "Tứ kết 1", slots: ["Nhất A", "Nhì B"] },
  { id: "qf2", label: "Tứ kết 2", slots: ["Nhì A", "Nhất B"] },
  { id: "qf3", label: "Tứ kết 3", slots: ["Nhất C", "Nhì D"] },
  { id: "qf4", label: "Tứ kết 4", slots: ["Nhì C", "Nhất D"] },
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
  qf1: { label: "Tứ kết 1" },
  qf2: { label: "Tứ kết 2" },
  qf3: { label: "Tứ kết 3" },
  qf4: { label: "Tứ kết 4" },
  g5: { label: "Bán kết 1" },
  g6: { label: "Bán kết 2" },
  g7: { label: "Chung kết" },
};


// Mock data (fallback) để xem UI khi API rỗng / lỗi
const mockMatches = [
  {
    id: "m1",
    competition: "Vòng bảng A",
    status: "ft",
    date: "2025-01-10",
    start_time: "2025-01-10T09:00:00Z",
    kickoff: "16:00",
    minute: 90,
    is_locked: true,
    team_a: "Đội Văn Bổng",
    team_a_color: groupColors.A,
    score_a: 2,
    team_b: "TD & AE",
    team_b_color: groupColors.B,
    score_b: 1,
    events: [],
    predictions: [
      { full_name: "An Nguyen", pick: "2-1", pick_a: 2, pick_b: 1 },
      { full_name: "Bui Minh", pick: "1-1", pick_a: 1, pick_b: 1 },
    ],
  },
  {
    id: "m2",
    competition: "Vòng bảng B",
    status: "ft",
    date: "2025-01-10",
    start_time: "2025-01-10T11:00:00Z",
    kickoff: "18:00",
    minute: 90,
    is_locked: true,
    team_a: "FC Thanh Triều",
    team_a_color: groupColors.B,
    score_a: 0,
    team_b: "Galacticos",
    team_b_color: groupColors.C,
    score_b: 3,
    events: [],
    predictions: [
      { full_name: "Tran Hoa", pick: "0-2", pick_a: 0, pick_b: 2 },
      { full_name: "An Nguyen", pick: "1-3", pick_a: 1, pick_b: 3 },
    ],
  },
  {
    id: "m3",
    competition: "Bán kết",
    status: "upcoming",
    date: "2025-01-11",
    start_time: "2025-01-11T09:00:00Z",
    kickoff: "16:00",
    minute: null,
    is_locked: false,
    team_a: "Nhat A",
    team_a_color: groupColors.A,
    score_a: null,
    team_b: "Nhat B",
    team_b_color: groupColors.B,
    score_b: null,
    events: [],
    predictions: [
      { full_name: "An Nguyen", pick: "2-0", pick_a: 2, pick_b: 0 },
      { full_name: "Le Thu", pick: "1-2", pick_a: 1, pick_b: 2 },
    ],
  },
];
const transformMatchesToDays = (matches) => {
  if (!Array.isArray(matches)) return [];

  const grouped = matches.reduce((acc, match) => {
    // Ưu tiên lấy biến date dạng string từ DB, nếu không có mới cắt từ start_time
    const dateKey = match.date || (match.start_time ? match.start_time.split("T")[0] : "unknown");
    if (!acc[dateKey]) acc[dateKey] = [];
    
    acc[dateKey].push({
      id: match.id,
      competition: match.competition,
      // Ưu tiên trạng thái lưu trong DB; chỉ fallback khi không có status
      status: match.status || (match.is_locked ? "ft" : "upcoming"),
      events: match.events || [],
      
      // QUAN TRỌNG: Ưu tiên hiển thị chuỗi kickoff từ DB (VD: "05:00")
      // Nếu không có mới phải format từ start_time
      kickoff: match.kickoff || (match.start_time ? new Date(match.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""),
      minute: match.minute,
      
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
  const [view, setView] = React.useState("results");
  const [matchDays, setMatchDays] = React.useState([]); // Bắt đầu với mảng rỗng
  const [selectedSection, setSelectedSection] = React.useState(null);
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [matchModalTab, setMatchModalTab] = React.useState("info");
  const [user, setUser] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [publicTab, setPublicTab] = React.useState("bracket");
  const [leaderboard, setLeaderboard] = React.useState([]);

  const isAdmin = user?.role === "admin";

  // Fetch match list and hydrate events from detail API so admin view stays in sync
  const fetchMatchesWithEvents = React.useCallback(async () => {
    let matches = [];
    try {
      matches = await matchApi.getAllMatches();
    } catch (error) {
      console.error("Failed to load matches:", error);
      setMatchDays(transformMatchesToDays(mockMatches));
      return;
    }

    try {
      const matchesWithEvents = await Promise.all(
        matches.map(async (match) => {
          try {
            const detail = await matchApi.getMatchDetail(match.id);
            return {
              ...match,
              ...detail,
              events: detail.events || [],
              predictions: detail.predictors || match.predictions || [],
            };
          } catch (error) {
            console.error("Failed to load match detail:", match.id, error);
            return { ...match, events: [], predictions: match.predictions || [] };
          }
        })
      );
      const data = matchesWithEvents.length > 0 ? matchesWithEvents : mockMatches;
      setMatchDays(transformMatchesToDays(data));
    } catch (error) {
      console.error("Failed to hydrate matches:", error);
      setMatchDays(transformMatchesToDays(mockMatches));
    }
  }, []);

  const fetchLeaderboard = React.useCallback(async () => {
    try {
      const data = await matchApi.getLeaderboard();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      setLeaderboard([]);
    }
  }, []);

  // 1. Fetch dữ liệu trận đấu và bảng điểm khi load trang
  React.useEffect(() => {
    fetchMatchesWithEvents();
    fetchLeaderboard();
  }, [fetchMatchesWithEvents, fetchLeaderboard]);

  // Refresh leaderboard when mở tab BXH
  React.useEffect(() => {
    if (publicTab === "predictions" && leaderboard.length === 0) {
      fetchLeaderboard();
    }
  }, [publicTab, leaderboard.length, fetchLeaderboard]);

  const loadUsers = React.useCallback(async () => {
    try {
      const list = await userAdminApi.getAll();
      setUsers(list || []);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  }, []);

  React.useEffect(() => {
    if (view === "admin") {
      loadUsers();
    }
  }, [view, loadUsers]);

  // 2. Kết nối WebSocket để nhận điểm số Realtime
  React.useEffect(() => {
    // Lưu ý: Port 8000 là port của FastAPI
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";
    const ws = new WebSocket(`${wsBaseUrl}/ws/live-scores`);

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

          fetchLeaderboard();
        }
      } catch (err) {
        console.error("WS Error:", err);
      }
    };

    return () => ws.close();
  }, [fetchLeaderboard]);

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
    setPublicTab("results");
  };

  const handleUpdateDay = (dayId, updates) => {
    setMatchDays((prev) => prev.map((day) => (day.id === dayId ? { ...day, ...updates } : day)));
  };

  // Helper reload toàn bộ danh sách trận và bảng điểm từ API
  const reloadMatches = React.useCallback(() => {
    fetchMatchesWithEvents();
    fetchLeaderboard();
  }, [fetchMatchesWithEvents, fetchLeaderboard]);

  // Logic thêm trận mới (chỉ update UI tạm thời, thực tế API đã gọi xong mới reload list)
  const handleAddMatch = (dayId, match) => {
     // Nên reload lại toàn bộ list từ API để đảm bảo đúng sort
     reloadMatches();
  };

  const handleUpdateMatch = (dayId, matchId, updates) => {
    // Gọi API lấy lại toàn bộ danh sách để đảm bảo sort đúng và giữ đúng
    reloadMatches();
  };

  const handleDeleteMatch = (dayId, matchId) => {
    setMatchDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, matches: (day.matches || []).filter((m) => m.id !== matchId) } : day))
    );
  };

  const handleOpenMatch = (match) => {
    setSelectedMatch(match);
    setMatchModalTab("info");
  };

  const handlePredictMatch = (match) => {
    setSelectedMatch(match);
    setMatchModalTab("predictions");
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
    setView("results");
  };

  const selectedLabel = selectedSection ? sectionMatches[selectedSection]?.label : null;

  return (
    <div className="app">
      <div className="backdrop" />
      <main className="shell">
        <header className="hero">
          <div className="hero-main">
            <div className="hero-logos">
              <img src={logoLeft} alt="Tournament partner logo left" className="hero-logo" />
              <img src={logoCenter} alt="Tournament main logo" className="hero-logo hero-logo--main" />
              <img src={logoRight} alt="Tournament partner logo right" className="hero-logo" />
            </div>
            <div className="hero-text">
              <h2>BTEC FOOTBALL CHAMPIONSHIP 2025</h2>
            </div>
          </div>
        </header>

        {isAdmin && (
          <div className="page-tabs">
            <button className={`page-tab ${view === "results" ? "is-active" : ""}`} type="button" onClick={() => setView("results")}>
              Kết quả
            </button>
            <button className={`page-tab ${view === "admin" ? "is-active" : ""}`} type="button" onClick={() => setView("admin")}>
              Admin
            </button>
          </div>
        )}

        {view === "admin" ? (
          <section className="section-block">
            <AdminPanel
              matchDays={matchDays}
              users={users}
              onRefreshUsers={loadUsers}
              onUpdateDay={handleUpdateDay}
              onAddMatch={handleAddMatch}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
              onReloadMatches={reloadMatches}
            />
          </section>
        ) : (
          <>
            <div className="page-tabs">
              <button
                className={`page-tab ${publicTab === "bracket" ? "is-active" : ""}`}
                type="button"
                onClick={() => {
                  setPublicTab("bracket");
                  setSelectedSection(null);
                }}
              >
                Giải đấu
              </button>
              <button
                className={`page-tab ${publicTab === "results" ? "is-active" : ""}`}
                type="button"
                onClick={() => setPublicTab("results")}
              >
                Tất cả trận đấu
              </button>
              <button
                className={`page-tab ${publicTab === "predictions" ? "is-active" : ""}`}
                type="button"
                onClick={() => setPublicTab("predictions")}
              >
                BXH dự đoán
              </button>
            </div>

            {publicTab === "bracket" && (
              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Giải đấu</p>
                    <h2>Sơ đồ giải đấu</h2>
                    <p className="muted" style={{ margin: 0 }}>Ấn vào nhánh để xem lịch đấu tương ứng.</p>
                  </div>
                  {selectedLabel && (
                    <button className="primary-btn ghost-btn" type="button" onClick={() => setSelectedSection(null)}>
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <BracketBoard onSectionSelect={handleSectionSelect} />
              </section>
            )}

            {publicTab === "results" && (
              selectedSection ? (
                <section className="section-block">
                  <ResultsFeed
                    matchDays={matchDays}
                    selectedLabel={selectedLabel}
                    onSelectMatch={handleOpenMatch}
                    onPredictMatch={handlePredictMatch}
                    onOpenAuth={() => setShowAuth(true)}
                    user={user}
                    onLogout={handleLogout}
                  />
                </section>
              ) : (
                <section className="section-block">
                  <div className="results" style={{ textAlign: "center" }}>
                    <p className="eyebrow">Chưa chọn nhánh</p>
                    <p className="muted">Hãy bấm vào một nhánh trong cây đấu để xem danh sách trận đấu.</p>
                  </div>
                </section>
              )
            )}
            {publicTab === "predictions" && (
              <section className="section-block">
                <PredictionLeaderboard matchDays={matchDays} leaderboardData={leaderboard} />
              </section>
            )}
          </>
        )}

        <AuthModal 
          open={showAuth} 
          onClose={() => setShowAuth(false)} 
          onAuthSubmit={handleAuthSubmit} 
        />
        {selectedMatch && (
          <MatchDetailModal
            match={selectedMatch}
            user={user}
            initialTab={matchModalTab}
            onClose={() => {
              setSelectedMatch(null);
              setMatchModalTab("info");
            }}
          />
        )}
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
        <div className="round-anchor round-anchor--group" />
        <div className="round-anchor round-anchor--quarter" />
        <div className="round-anchor round-anchor--semi" />
        <div className="round-anchor round-anchor--final" />
        <div className="round-anchor round-anchor--champ" />
        <div className="board-grid">
          <GameCard game={quarterGames[0]} variant="quarter" extraClass="pos-q1" onClick={() => onSectionSelect("g1")} />
          <GameCard game={quarterGames[1]} variant="quarter" extraClass="pos-q2" onClick={() => onSectionSelect("g2")} />
          <GameCard game={quarterGames[2]} variant="quarter" extraClass="pos-q3" onClick={() => onSectionSelect("g3")} />
          <GameCard game={quarterGames[3]} variant="quarter" extraClass="pos-q4" onClick={() => onSectionSelect("g4")} />
          <GameCard game={knockoutQuarterGames[0]} variant="quarter" extraClass="pos-qf1" onClick={() => onSectionSelect("qf1")} />
          <GameCard game={knockoutQuarterGames[1]} variant="quarter" extraClass="pos-qf2" onClick={() => onSectionSelect("qf2")} />
          <GameCard game={knockoutQuarterGames[2]} variant="quarter" extraClass="pos-qf3" onClick={() => onSectionSelect("qf3")} />
          <GameCard game={knockoutQuarterGames[3]} variant="quarter" extraClass="pos-qf4" onClick={() => onSectionSelect("qf4")} />
          <GameCard game={semiGames[0]} variant="semi" extraClass="pos-s1" onClick={() => onSectionSelect("g5")} />
          <GameCard game={semiGames[1]} variant="semi" extraClass="pos-s2" onClick={() => onSectionSelect("g6")} />
          <GameCard game={finalGame} variant="final" extraClass="pos-f" onClick={() => onSectionSelect("g7")} />
          <ChampionCard extraClass="pos-champion" />
          <Connector className="connector connector-gq-top" mode="cross" />
          <Connector className="connector connector-gq-bottom" mode="cross" />
          <Connector className="connector connector-q12" mode="q" />
          <Connector className="connector connector-q34" mode="q" />
          <Connector className="connector connector-semis" mode="semi" />
          <Connector className="connector connector-final" mode="final" />
          <div className="round-label round-label--group">Vong bang</div>
          <div className="round-label round-label--quarter">Tu ket</div>
          <div className="round-label round-label--semi">Ban ket</div>
          <div className="round-label round-label--final">Chung ket</div>
          <div className="round-label round-label--champ">Vo dich</div>
        </div>
      </div>
    </section>
  );
}

function ResultsFeed({ matchDays = [], selectedLabel, onSelectMatch, onPredictMatch, onOpenAuth, user, onLogout }) {
  const formatDay = (dateStr, fallbackLabel) => {
    const d = dateStr ? new Date(dateStr) : null;
    if (!d || Number.isNaN(d.getTime())) return { full: fallbackLabel || "-", short: "", numeric: "" };
    return {
      full: d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      short: d.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase(),
      numeric: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };
  };

  return (
    <section className="results">
      <div className="results-header">
        <div><p className="eyebrow">Trang kết quả</p><h2>Tất cả trận đấu</h2>{selectedLabel && <p className="muted">Đang xem nhánh: {selectedLabel}</p>}</div>
        <div className="results-actions">
          {user ? (
            <div
              className="user-strip"
              style={{
                margin: 0,
                justifyContent: "flex-end",
              }}
            >
              <span className="muted">
                Đang đăng nhập: <strong>{user.fullName || user.studentId}</strong>
                {user.role === "admin" && " (Admin)"}
              </span>
              <button className="primary-btn ghost-btn" type="button" onClick={() => onLogout?.()}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <button className="primary-btn ghost-btn" type="button" onClick={() => onOpenAuth?.()}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
      <div className="match-days">
        {matchDays.map((day) => (
          <article key={day.id} className="match-day">
            {(() => {
              const info = formatDay(day.id, day.label);
              return (
                <div
                  className="match-day__heading"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  {info.short && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 42,
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "rgba(91, 237, 159, 0.18)",
                        color: "#5bed9f",
                        fontWeight: 800,
                      }}
                    >
                      {info.short}
                    </span>
                  )}
                  <div>{info.full}</div>
                </div>
              );
            })()}
            <div className="match-list">
              {(day.matches || []).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={() => onSelectMatch?.(match)}
                  onPredict={() => onPredictMatch?.(match)}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PredictionLeaderboard({ matchDays = [], leaderboardData = [] }) {
  const formatTimeGap = (seconds) => {
    if (!seconds || seconds <= 0) return "0m";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  };

  const fallbackLeaderboard = React.useMemo(() => {
    const scoreOutcome = (a, b) => (a > b ? "home" : a < b ? "away" : "draw");
    const parsePick = (pick) => {
      if (!pick) return null;
      const parts = pick.split(/[-:x]/).map((s) => s.trim());
      if (parts.length < 2) return null;
      const sa = Number(parts[0]);
      const sb = Number(parts[1]);
      if (Number.isNaN(sa) || Number.isNaN(sb)) return null;
      return { sa, sb };
    };
    const calcScore = (pHome, pAway, rHome, rAway) => {
      const result = (h, a) => (h > a ? "H" : h < a ? "A" : "D");
      const resP = result(pHome, pAway);
      const resR = result(rHome, rAway);
      const diffSum = Math.abs(pHome - rHome) + Math.abs(pAway - rAway);
      if (pHome === rHome && pAway === rAway) return 100;
      if (resP === resR && (pHome - pAway) === (rHome - rAway)) return 70;
      if (resP === resR) return 50;
      if (diffSum === 1) return 30;
      if (diffSum === 2) return 10;
      return 0;
    };
    const isAdminName = (val) => typeof val === "string" && val.toLowerCase().includes("admin");

    const tally = {};
    matchDays.forEach(day => {
      (day.matches || []).forEach(m => {
        const status = m.status || (m.is_locked ? "ft" : "upcoming");
        const hasResult =
          (status === "ft" || m.is_locked) &&
          m.home &&
          m.away &&
          m.home.score != null &&
          m.away.score != null;
        if (!hasResult) return;
        const actualA = Number(m.home.score);
        const actualB = Number(m.away.score);
        if (Number.isNaN(actualA) || Number.isNaN(actualB)) return;

        const predictors = m.predictions || m.predictors || [];
        predictors.forEach(p => {
          const name =
            p.full_name ||
            p.fullName ||
            p.user_full_name ||
            p.userFullName ||
            p.user_msv ||
            p.msv ||
            "Ẩn danh";
          if (isAdminName(name)) return;
          const id =
            (p.user_msv || p.msv || p.userId || p.user_id || p.userID || name || "anon")
              .toString()
              .trim()
              .toLowerCase();
          if (isAdminName(id)) return;
          const key = id || name || "anon";
          if (!tally[key]) tally[key] = { name: name || "Ẩn danh", total: 0, points: 0, exact: 0, totalTimeSeconds: null };
          const pick = parsePick(p.pick || p.prediction || p.score_pred);
          if (!pick) return;
          tally[key].total += 1;
          const points = calcScore(p.pick_a ?? pick.sa, p.pick_b ?? pick.sb, actualA, actualB);
          tally[key].points += points;
          if (points === 100) tally[key].exact += 1;
        });
      });
    });
    return Object.values(tally)
      .sort((a, b) => b.points - a.points || b.exact - a.exact);
  }, [matchDays]);

  const displayLeaderboard = React.useMemo(() => {
    if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
      return leaderboardData.map((item) => ({
        name: item.full_name || item.user_msv || "Ẩn danh",
        points: item.total_points ?? item.points ?? 0,
        total: item.prediction_count ?? item.total ?? null,
        totalTimeSeconds: item.total_time_seconds ?? null,
        rank: item.rank,
      }));
    }
    return fallbackLeaderboard;
  }, [leaderboardData, fallbackLeaderboard]);

  return (
    <div className="results">
      <div className="results-header">
        <div>
          <p className="eyebrow">Bảng xếp hạng</p>
          <h2>Top dự đoán chính xác</h2>
        </div>
      </div>
      {displayLeaderboard.length === 0 ? (
        <div className="results-empty">Chưa có dữ liệu dự đoán.</div>
      ) : (
          <div className="match-list">
            {displayLeaderboard.map((item, idx) => (
              <div key={`${item.name}-${item.rank || idx}`} className="match-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="status-pill status-pill--upcoming" style={{ minWidth: 32, justifyContent: "center" }}>{item.rank || idx + 1}</span>
                  <strong>{item.name}</strong>
                </div>
                <div className="muted" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span>Điểm: <strong>{item.points}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

function AdminPanel({ matchDays = [], users = [], onRefreshUsers, onUpdateDay, onAddMatch, onUpdateMatch, onDeleteMatch, onReloadMatches }) {
  // Hàm xử lý gọi API chung để không phải reload trang
  const handleApiAction = async (promise, onSuccess) => {
    try {
      await promise;
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.detail || error.message));
    }
  };

  const [section, setSection] = React.useState("matches");
  const isNarrow = useIsNarrow(768);

  return (
    <section className="admin-panel" style={isNarrow ? { padding: "12px 10px 24px", maxWidth: "540px", width: "100%", margin: "0 auto", boxSizing: "border-box", overflowX: "hidden" } : {}}>
      <div className="results-header">
        <div><p className="eyebrow">Trang admin</p><h2>{section === "matches" ? "Quản lý trận đấu" : "Quản lý user"}</h2></div>
        <div className="feed-tabs">
          <button className={`feed-tab ${section === "matches" ? "is-active" : ""}`} onClick={() => setSection("matches")}>Trận đấu</button>
          <button className={`feed-tab ${section === "users" ? "is-active" : ""}`} onClick={() => { setSection("users"); onRefreshUsers?.(); }}>User</button>
        </div>
      </div>

      <div className="admin-grid" style={{ display: "flex", flexDirection: "column", gap: isNarrow ? 16 : 24, width: "100%", boxSizing: "border-box" }}>
        {section === "matches" ? (
          <>
            <div className="admin-card admin-card--wide" style={{ width: "100%", boxSizing: "border-box", minWidth: 0 }}>
              <div className="admin-card__head"><h4>Thêm trận mới</h4></div>
              <AdminMatchForm
                submitLabel="Thêm trận"
                onSubmit={(payload) => {
                  import('./api/adminApi').then(mod => {
                     handleApiAction(
                       mod.default.createMatch(payload),
                       () => {
                          alert("Đã thêm trận mới!");
                          onAddMatch?.();
                       }
                     );
                  });
                }}
              />
            </div>

            {matchDays.length > 0 ? (
              <div className="admin-match-list" style={{ display: "flex", flexDirection: "column", gap: isNarrow ? 12 : 16 }}>
                 <div className="admin-card__head"><h3>Danh sách trận</h3></div>
                 {matchDays.map((day) => (
                    <div key={day.id} style={{ marginBottom: isNarrow ? 12 : 20 }}>
                      <h5 className="eyebrow" style={{margin: "10px 0", color: "#5bed9f", borderBottom: "1px solid #333"}}>
                        {day.label}
                      </h5>
                      {(day.matches || []).map((match) => (
                        <AdminMatchCard
                          key={match.id}
                          match={match}
                          onUpdate={(payload) => {
                             import('./api/adminApi').then(mod => {
                                handleApiAction(
                                  mod.default.updateMatch(match.id, payload),
                                  () => { onUpdateMatch?.(day.id, match.id, payload); }
                                );
                             });
                          }}
                          onDelete={() => {
                            if (!window.confirm(`Xóa trận ${match.home.name} vs ${match.away.name}?`)) return;
                            import('./api/adminApi').then(mod => {
                                handleApiAction(
                                  mod.default.deleteMatch(match.id),
                                  () => { onDeleteMatch?.(day.id, match.id); }
                                );
                            });
                          }}
                          onRefresh={onReloadMatches}
                        />
                      ))}
                    </div>
                 ))}
              </div>
            ) : <p className="muted">Chưa có trận đấu nào.</p>}
          </>
        ) : (
          <>
            <div className="admin-card admin-card--wide">
              <div className="admin-card__head">
                <h4>Quản lý user</h4>
                <button className="primary-btn ghost-btn" type="button" onClick={onRefreshUsers}>Tải lại</button>
              </div>
              {users && users.length > 0 ? (
                <div className="admin-user-grid" style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: isNarrow ? 12 : 16 }}>
                  {users.map((u) => {
                    const active = u.is_active !== false;
                    return (
                      <div key={u.id} className="admin-user-tile">
                        <div className="admin-user-top">
                          <div>
                            <div className="admin-user-name">{u.full_name}</div>
                            <div className="admin-user-meta">{u.msv} · {u.role}</div>
                          </div>
                          <span className={`user-status-pill ${active ? 'is-active' : 'is-locked'}`}>{active ? "Đang hoạt động" : "Đã khóa"}</span>
                        </div>
                        <div className="admin-user-actions">
                          <button
                            className="primary-btn ghost-btn"
                            type="button"
                            onClick={() => {
                              const confirmed = window.confirm(`${active ? "Khóa" : "Mở khóa"} user ${u.full_name}?`);
                              if (!confirmed) return;
                              userAdminApi.lock(u.id, !active).then(onRefreshUsers).catch(err => alert(err.response?.data?.detail || err.message));
                            }}
                          >
                            {active ? "Khóa" : "Mở khóa"}
                          </button>
                          <button
                            className="primary-btn"
                            type="button"
                            onClick={() => {
                              const confirmed = window.confirm(`Xóa user ${u.full_name}?`);
                              if (!confirmed) return;
                              userAdminApi.delete(u.id).then(onRefreshUsers).catch(err => alert(err.response?.data?.detail || err.message));
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="muted">Chua có user.</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
function AdminMatchCard({ match, onUpdate, onDelete, onRefresh }) {
  const isNarrow = useIsNarrow(768);
  const [isEditing, setIsEditing] = React.useState(false);
  const [eventForm, setEventForm] = React.useState({ team_side: "a", player: "", minute: "" });
  const statusLabel = match.status === "live" ? "Đang diễn ra" : match.status === "ft" ? "Kết thúc" : "Sắp diễn ra";
  const eventsA = Array.isArray(match.events) ? match.events.filter(ev => ev.team_side !== "b") : [];
  const eventsB = Array.isArray(match.events) ? match.events.filter(ev => ev.team_side === "b") : [];
  const eventsGridStyle = {
    margin: "12px auto 10px",
    display: "grid",
    gridTemplateColumns: isNarrow ? "repeat(2, minmax(140px, 1fr))" : "repeat(2, minmax(260px, 340px))",
    columnGap: isNarrow ? 12 : 120,
    rowGap: isNarrow ? 8 : 0,
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: isNarrow ? "100%" : "1020px",
    padding: isNarrow ? "0 8px" : "0 16px",
    boxSizing: "border-box",
  };
  const eventsColLeftStyle = { width: "100%", maxWidth: isNarrow ? "100%" : 320, justifySelf: isNarrow ? "center" : "end", textAlign: isNarrow ? "left" : "right" };
  const eventsColRightStyle = { width: "100%", maxWidth: isNarrow ? "100%" : 320, justifySelf: isNarrow ? "center" : "start", textAlign: "left" };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.player || !eventForm.minute) {
      alert("Nhập tên cầu thủ và phút ghi bàn");
      return;
    }
    try {
      await matchApi.addEvent(match.id, {
        player: eventForm.player,
        minute: eventForm.minute,
        type: "goal",
        team_side: eventForm.team_side,
      });
      setEventForm({ team_side: "a", player: "", minute: "" });
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="admin-card admin-card--match" style={{ width: "100%", minWidth: 0, boxSizing: "border-box", padding: isNarrow ? "12px" : undefined, overflowX: "hidden" }}>
      <div className="admin-card__head">
        <div>
          <p className="eyebrow">{match.competition}</p>
          <strong>{match.home?.name} vs {match.away?.name}</strong>
          <div className="muted"><span>{statusLabel}</span> • {match.kickoff}</div>
        </div>
        <div className="admin-card__actions">
          <button className="primary-btn ghost-btn" onClick={() => setIsEditing((v) => !v)}>{isEditing ? "Hủy" : "Sửa"}</button>
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

          <div className="admin-events">
        <div className="admin-card__head" style={{ padding: "10px 0" }}>
          <h5>Ghi bàn / sự kiện</h5>
        </div>
        <div
          className="admin-events-list"
          style={eventsGridStyle}
        >
          <div style={eventsColLeftStyle}>
            {eventsA.length > 0 ? (
              <ul className="event-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {eventsA.map((ev, idx) => (
                  <li
                    key={`a-${idx}`}
                    className="event-item"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 44px",
                      columnGap: 10,
                      alignItems: "center",
                      padding: "4px 0",
                      wordBreak: "break-word",
                    }}
                  >
                    <span style={{ wordBreak: "break-word", justifySelf: "end" }}>{ev.player || "?"}</span>
                    <span className="eyebrow" style={{ justifySelf: "end" }}>{ev.minute || "?"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">-</p>}
          </div>
          <div style={eventsColRightStyle}>
            {eventsB.length > 0 ? (
              <ul className="event-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {eventsB.map((ev, idx) => (
                  <li
                    key={`b-${idx}`}
                    className="event-item"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px 1fr",
                      columnGap: 10,
                      alignItems: "center",
                      padding: "4px 0",
                      wordBreak: "break-word",
                    }}
                  >
                    <span className="eyebrow">{ev.minute || "?"}</span>
                    <span style={{ wordBreak: "break-word" }}>{ev.player || "?"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">-</p>}
          </div>
        </div>

        <form className="admin-event-form" onSubmit={handleAddEvent}>
          <div className="admin-form-row">
            <label className="field">
              <span>Ð?i</span>
              <select
                className="field-select"
                value={eventForm.team_side}
                onChange={(e) => setEventForm((p) => ({ ...p, team_side: e.target.value }))}
              >
                <option value="a">{match.home?.name || "Đội A"}</option>
                <option value="b">{match.away?.name || "Đội B"}</option>
              </select>
            </label>
            <label className="field">
              <span>Cầu thủ</span>
              <input
                type="text"
                value={eventForm.player}
                onChange={(e) => setEventForm((p) => ({ ...p, player: e.target.value }))}
                placeholder="Tên người ghi bàn"
              />
            </label>
            <label className="field">
              <span>Phút</span>
              <input
                type="text"
                value={eventForm.minute}
                onChange={(e) => setEventForm((p) => ({ ...p, minute: e.target.value }))}
                placeholder="45'"
              />
            </label>
            <div className="admin-actions-row" style={{ marginTop: 24 }}>
              <button className="primary-btn" type="submit">Thêm</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminMatchForm({ initialMatch, submitLabel = "Luu", onSubmit }) {
  const emptyForm = {
    competition: "", status: "upcoming", date: "", kickoff: "", minute: "",
    homeName: "", homeLogo: "", homeScore: "", awayName: "", awayLogo: "", awayScore: "",
  };
  const isNarrow = useIsNarrow(768);

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

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
    gap: isNarrow ? 12 : 16,
    width: "100%",
  };
  const teamsRowStyle = {
    display: "grid",
    gridTemplateColumns: isNarrow ? "1fr" : "repeat(2, minmax(260px, 1fr))",
    gap: isNarrow ? 12 : 20,
    width: "100%",
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-row" style={rowStyle}>
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

      <div className="admin-form-row admin-form-row--teams" style={teamsRowStyle}>
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
  const isSemi = mode === "semi";
  const isFinal = mode === "final";
  const isGroup = mode === "group";
  const isCross = mode === "cross";
  const viewBox = isSemi
    ? "0 0 140 400"
    : isFinal
    ? "0 0 120 220"
    : isCross
    ? "0 0 140 200"
    : isGroup
    ? "0 0 140 120"
    : "0 0 140 200";
  let path = isSemi
    ? "M0 100 C 40 100 40 150 80 200 C 40 250 40 300 0 300 M80 200 C 110 200 125 200 140 200"
    : isFinal
    ? "M0 110 C 30 110 60 110 120 110"
    : isCross
    ? "M0 40 C 32 40 52 70 70 100 C 88 130 108 160 140 160 M0 160 C 32 160 52 130 70 100 C 88 70 108 40 140 40"
    : isGroup
    ? "M0 60 C 30 60 60 60 140 60"
    : "M0 50 C 35 50 35 70 70 100 C 35 130 35 150 0 150 M70 100 C 100 100 125 100 140 100";
  return (
    <div className={className}>
      <svg viewBox={viewBox} className="connector-svg" preserveAspectRatio="none">
        <path className="connector-path" d={path} />
      </svg>
    </div>
  );
}

function MatchCard({ match, onSelect, onPredict }) {
  const statusLabel = match.status === "live" ? `LIVE ${match.minute || ""}` : match.status === "ft" ? "End" : match.kickoff;
  
  // Trạng thái tiếng Việt có dấu
  const statusText = match.status === "live" ? "Đang diễn ra" 
                   : match.status === "ft" ? "Kết thúc" 
                   : "Sắp diễn ra";
  const canPredict = match.status === "upcoming" && !match.is_locked;

  const handlePredictClick = (e) => {
    e.stopPropagation();
    if (onPredict) onPredict(match);
    else onSelect?.();
  };
  return (
    <article className={`match-card match-card--${match.status} ${onSelect ? "match-card--clickable" : ""}`} onClick={onSelect}>
      <div className="match-meta">
        <span className="competition">{match.competition}</span>
        <StatusPill status={match.status} label={statusText} />
      </div>
      {match.status !== "ft" && <div className="match-status match-status--center"><StatusPill status={match.status} label={statusLabel} /></div>}
      <div className="match-main">
        <TeamCell team={match.home} />
        <div className="scoreline"><span className="score">{match.home.score ?? "-"}</span><span className="dash">-</span><span className="score">{match.away.score ?? "-"}</span></div>
        <TeamCell team={match.away} align="right" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 12, flexWrap: "wrap" }}>
        <span className="muted" style={{ fontSize: 13 }}>Ấn để xem chi tiết & dự đoán</span>
        <button
          className="primary-btn"
          type="button"
          disabled={!canPredict}
          onClick={handlePredictClick}
          style={{
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.2,
            boxShadow: "0 0 0 2px rgba(91, 237, 159, 0.25), 0 10px 30px rgba(91, 237, 159, 0.35)",
            background: canPredict ? "linear-gradient(120deg, #5bed9f, #38d27f)" : "rgba(255,255,255,0.12)",
            color: canPredict ? "#0a2c1d" : "#ccc",
            border: "none",
            transition: "transform 120ms ease, box-shadow 120ms ease",
            transform: canPredict ? "translateY(-1px)" : "none",
          }}
        >
          {canPredict ? "Dự đoán" : "Đã khóa"}
        </button>
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

function MatchDetailModal({ match, user, initialTab = "info", onClose }) {
  const [detail, setDetail] = React.useState(null);
  const [homePick, setHomePick] = React.useState("");
  const [awayPick, setAwayPick] = React.useState("");
  const [tab, setTab] = React.useState(initialTab);
  const isNarrow = useIsNarrow(640);
  const detailStyle = {
    width: isNarrow ? "calc(100vw - 32px)" : "min(900px, calc(100vw - 48px))",
    maxWidth: "calc(100vw - 24px)",
    margin: "0 auto",
    padding: isNarrow ? "16px" : "24px",
  };

  React.useEffect(() => {
    if (match?.id) matchApi.getMatchDetail(match.id).then(setDetail).catch(console.error);
  }, [match]);

  React.useEffect(() => {
    setTab(initialTab || "info");
    setHomePick("");
    setAwayPick("");
  }, [match, initialTab]);

  const handlePredict = async () => {
    if (!homePick || !awayPick) return alert("Vui lòng nhập tỷ số");
    try {
      await matchApi.predict({ match_id: match.id, score_a: parseInt(homePick), score_b: parseInt(awayPick) });
      alert("Dự đoán thành công!");
      const data = await matchApi.getMatchDetail(match.id);
      setDetail(data);
    } catch (error) {
      const msg = error.response?.data?.detail || "Lỗi dự đoán";
      alert(msg);
      if ((msg || "").toLowerCase().includes("đã dự đoán")) {
        try {
          const data = await matchApi.getMatchDetail(match.id);
          setDetail(data);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const displayMatch = detail || match; 
  const stats = detail?.stats || { home_percent: 0, draw_percent: 0, away_percent: 0, total: 0 };
  const predictors = detail?.predictors || [];
  const maskName = (name) => name ? name.substring(0, 2) + "***" + name.slice(-2) : "An danh";
  const currentUserId = (user?.studentId || "").toString().trim().toLowerCase();
  const currentUserName = (user?.fullName || user?.full_name || "").toString().trim().toLowerCase();

  const isSameUser = (p) => {
    const idCandidates = [
      p.user_msv,
      p.msv,
      p.userId,
      p.user_id,
      p.userID,
    ]
      .map((v) => (v || "").toString().trim().toLowerCase())
      .filter(Boolean);
    const nameCandidates = [
      p.full_name,
      p.fullName,
      p.user_full_name,
      p.userFullName,
      p.name,
    ]
      .map((v) => (v || "").toString().trim().toLowerCase())
      .filter(Boolean);
    return (
      (currentUserId && idCandidates.includes(currentUserId)) ||
      (currentUserName && nameCandidates.includes(currentUserName))
    );
  };

  const myPrediction = React.useMemo(
    () => (predictors || []).find((p) => isSameUser(p)),
    [predictors, currentUserId, currentUserName]
  );
  const hasPredicted = Boolean(myPrediction);
  const sortedPredictors = myPrediction
    ? [myPrediction, ...predictors.filter(p => !isSameUser(p))]
    : predictors;
  const status = (displayMatch.status || (displayMatch.is_locked ? "ft" : "upcoming"));
  const isUpcoming = status === "upcoming" && !displayMatch.is_locked;
  const eventsA = Array.isArray(displayMatch.events) ? displayMatch.events.filter(ev => ev.team_side !== "b") : [];
  const eventsB = Array.isArray(displayMatch.events) ? displayMatch.events.filter(ev => ev.team_side === "b") : [];
  const minuteWidth = isNarrow ? 28 : 44;
  const eventFontSize = isNarrow ? "12px" : "14px";
  const eventsGridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(2, minmax(${isNarrow ? 120 : 220}px, 1fr))`,
    columnGap: isNarrow ? 8 : 48,
    rowGap: isNarrow ? 8 : 0,
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: isNarrow ? "100%" : "820px",
    padding: isNarrow ? "0 2px" : "0 12px",
    boxSizing: "border-box",
    margin: "12px auto"
  };
  const eventsColLeftStyle = { width: "100%", maxWidth: isNarrow ? 240 : 320, justifySelf: "end", textAlign: "right" };
  const eventsColRightStyle = { width: "100%", maxWidth: isNarrow ? 240 : 320, justifySelf: "start", textAlign: "left" };
  const kickoffLabel = displayMatch.kickoff
    || (displayMatch.start_time ? new Date(displayMatch.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-");
  const clampScore = (val) => {
    if (val === "" || val == null) return "";
    const num = Number(val);
    if (Number.isNaN(num)) return "";
    return Math.max(0, num);
  };

  React.useEffect(() => {
    if (myPrediction?.pick) {
      const parts = myPrediction.pick.split(/[-:x]/).map((s) => s.trim());
      if (parts.length >= 2) {
        setHomePick(clampScore(parts[0]).toString());
        setAwayPick(clampScore(parts[1]).toString());
      }
    }
  }, [myPrediction]);

  return (
    <div className="match-detail-backdrop">
      <div className="match-detail" style={detailStyle}>
        <div className="match-detail__head">
          <div>
            <p className="eyebrow">Chi tiết</p>
            <h3>{displayMatch.team_a} vs {displayMatch.team_b}</h3>
            <p className="muted" style={{ marginTop: 4 }}>Giờ bóng lăn: {kickoffLabel}</p>
          </div>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div className="match-tabs" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className={`feed-tab ${tab === "info" ? "is-active" : ""}`} onClick={() => setTab("info")}>Thông tin</button>
          <button className={`feed-tab ${tab === "predictions" ? "is-active" : ""}`} onClick={() => setTab("predictions")}>
            Dự đoán ({stats.total || 0})
          </button>
        </div>

        <div className="match-detail__body">
          {tab === "info" ? (
            <>
              <div className="match-detail__teams">
                <TeamCell team={{ name: displayMatch.team_a, logo: displayMatch.team_a_logo, color: displayMatch.team_a_color }} />
                <div className="scoreline scoreline--lg"><span className="score">{displayMatch.score_a ?? "-"}</span>-<span className="score">{displayMatch.score_b ?? "-"}</span></div>
                <TeamCell team={{ name: displayMatch.team_b, logo: displayMatch.team_b_logo, color: displayMatch.team_b_color }} align="right" />
              </div>

              <div className="match-detail__events" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p className="eyebrow">Diễn biến</p>
                <div style={eventsGridStyle}>
                  <div style={eventsColLeftStyle}>
                    {eventsA.length > 0 ? (
                      <ul className="event-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {eventsA.map((ev, idx) => (
                          <li
                            key={`a-${idx}`}
                            className="event-item"
                            style={{ display: "grid", gridTemplateColumns: `1fr ${minuteWidth}px`, columnGap: 10, alignItems: "center", padding: "4px 0", wordBreak: "break-word", fontSize: eventFontSize }}
                          >
                            <span style={{ wordBreak: "break-word", justifySelf: "end", textAlign: "right" }}>{ev.player || "?"}</span>
                            <span className="eyebrow" style={{ justifySelf: "end", fontSize: eventFontSize }}>{ev.minute || "?"}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="muted">-</p>}
                  </div>
                  <div style={eventsColRightStyle}>
                    {eventsB.length > 0 ? (
                      <ul className="event-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {eventsB.map((ev, idx) => (
                          <li
                            key={`b-${idx}`}
                            className="event-item"
                            style={{ display: "grid", gridTemplateColumns: `${minuteWidth}px 1fr`, columnGap: 10, alignItems: "center", padding: "4px 0", wordBreak: "break-word", fontSize: eventFontSize }}
                          >
                            <span className="eyebrow" style={{ fontSize: eventFontSize }}>{ev.minute || "?"}</span>
                            <span style={{ wordBreak: "break-word" }}>{ev.player || "?"}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="muted">-</p>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="predict-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {hasPredicted && myPrediction && (
                <div
                  style={{
                    padding: "10px 12px",
                    background: "rgba(91, 237, 159, 0.08)",
                    borderRadius: 10,
                    border: "1px solid rgba(91, 237, 159, 0.3)",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="muted" style={{ fontWeight: 600 }}>Dự đoán của tôi</span>
                  <span>{myPrediction.pick}</span>
                </div>
              )}
              <div className="predict-input" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="predict-input__row">
                  <div className="predict-team">{displayMatch.team_a}</div>
                  <input
                    className="predict-score"
                    type="number"
                    min="0"
                    value={homePick}
                    onChange={e => setHomePick(clampScore(e.target.value).toString())}
                  />
                  <span className="predict-input__dash">-</span>
                  <input
                    className="predict-score"
                    type="number"
                    min="0"
                    value={awayPick}
                    onChange={e => setAwayPick(clampScore(e.target.value).toString())}
                  />
                  <div className="predict-team">{displayMatch.team_b}</div>
                </div>
                <div className="predict-action" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                  <button
                    className="primary-btn predict-btn"
                    onClick={handlePredict}
                    disabled={!isUpcoming || hasPredicted}
                  >
                    {isUpcoming ? (hasPredicted ? "Bạn đã dự đoán" : "Gửi dự đoán") : "Đã khóa"}
                  </button>
                  {!isUpcoming && <div className="muted" style={{ fontSize: 12 }}>Dự đoán chỉ mở khi trận chưa bắt đầu</div>}
                </div>
              </div>
              <div className="predict-summary">
                <p className="eyebrow">Tổng lượt: {stats.total || 0}</p>
                {stats.total > 0 ? (
                  <div className="predict-bar predict-bar--stack">
                    <div className="predict-segment predict-segment--home" style={{width: `${stats.home_percent}%`}}>{stats.home_percent}%</div>
                    <div className="predict-segment predict-segment--draw" style={{width: `${stats.draw_percent}%`}}>{stats.draw_percent}%</div>
                    <div className="predict-segment predict-segment--away" style={{width: `${stats.away_percent}%`}}>{stats.away_percent}%</div>
                  </div>
                ) : (
                  <p className="muted">Chưa có ai dự đoán</p>
                )}
              </div>
              <div className="predict-list__body" style={{maxHeight: '200px', overflowY: 'auto', display: "flex", flexDirection: "column", gap: 8}}>
                {sortedPredictors.length === 0 && <p className="muted">Không có dữ liệu</p>}
                {sortedPredictors.map((p, i) => {
                  const raw =
                    p.full_name ||
                    p.fullName ||
                    p.user_full_name ||
                    p.userFullName ||
                    p.user_msv ||
                    p.msv ||
                    p.userId ||
                    p.user_id ||
                    p.userID ||
                    "";
                  const clean = raw ? raw.toString().trim() : "";
                  const firstChar = clean ? clean[0] : String.fromCharCode(65 + (i % 26));
                  const masked = `${firstChar}${"*".repeat(Math.max(3, (clean || "****").length - 1))}`;
                  const nameLabel = masked;
                  return (
                    <div key={i} className="predict-item" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{nameLabel}</span>
                      <span className="muted"></span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





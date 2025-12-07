import React from "react";
import { jwtDecode } from "jwt-decode"; // Cần cài: npm install jwt-decode
import authApi from "./api/authApi";   // Import API module

// --- DỮ LIỆU TĨNH (Sẽ thay bằng API trận đấu sau này) ---
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

const initialMatchDays = [
  {
    id: "yesterday",
    label: "Hôm qua, 18 Jan 2018",
    matches: [
      {
        id: "chelsea-norwich",
        competition: "FA Cup",
        status: "ft",
        home: { name: "Chelsea", score: 6, badge: "CFC", color: "#1746af" },
        away: { name: "Norwich", score: 4, badge: "NOR", color: "#f2d039" },
        note: "End",
        homeEvents: [
          { time: "12'", player: "Hazard" },
          { time: "45+1'", player: "Giroud" },
          { time: "68'", player: "M. Mount" },
        ],
        awayEvents: [
          { time: "22'", player: "Pukki" },
          { time: "76'", player: "Buendía" },
        ],
        predictions: [
          { name: "Nguyễn Văn A", pick: "3-1" },
          { name: "Trần Minh B", pick: "2-0" },
          { name: "Lê Q. C", pick: "1-1" },
        ],
      },
      {
        id: "espanyol-barca",
        competition: "Copa del Rey",
        status: "ft",
        home: { name: "Espanyol", score: 1, badge: "ESP", color: "#1f8adb" },
        away: { name: "Barcelona", score: 0, badge: "BAR", color: "#d61f3b" },
        note: "End",
        homeEvents: [
          { time: "34'", player: "Joselu" },
        ],
        awayEvents: [
          { time: "57'", player: "Lewandowski (miss pen)" },
        ],
        predictions: [
          { name: "Phạm T. D", pick: "0-2" },
          { name: "Hoàng Khang", pick: "1-3" },
        ],
      },
    ],
  },
  {
    id: "today",
    label: "Hôm nay, 19 Jan 2018",
    matches: [
      {
        id: "leganes-real",
        competition: "Copa del Rey",
        status: "live",
        minute: "4'",
        home: { name: "Leganés", score: 0, badge: "LEG", color: "#1f9dd6" },
        away: { name: "Real Madrid", score: 0, badge: "RMA", color: "#ffffff" },
        note: "Đang diễn ra",
        homeEvents: [],
        awayEvents: [],
        predictions: [
          { name: "Ngô Đức H", pick: "0-2" },
          { name: "L. Thảo", pick: "1-1" },
        ],
      },
      {
        id: "brugge-dortmund",
        competition: "Champions League",
        status: "ft",
        home: { name: "Club Brugge", score: 0, badge: "BRU", color: "#0d3b66" },
        away: { name: "Dortmund", score: 3, badge: "BVB", color: "#f1d300" },
        note: "Kết thúc",
        homeEvents: [],
        awayEvents: [
          { time: "18'", player: "Bynoe-Gittens" },
          { time: "60'", player: "Reus" },
          { time: "86'", player: "Brandt" },
        ],
        predictions: [
          { name: "Trịnh P. Nam", pick: "0-2" },
          { name: "Vũ Minh H", pick: "1-2" },
          { name: "L. My", pick: "0-1" },
        ],
      },
    ],
  },
  {
    id: "tomorrow",
    label: "Ngày mai, 20 Jan 2018",
    matches: [
      {
        id: "hertha-dortmund",
        competition: "Bundesliga R19",
        status: "upcoming",
        kickoff: "03:30",
        home: { name: "Hertha BSC", badge: "BSC", color: "#0f69b4" },
        away: { name: "Dortmund", badge: "BVB", color: "#f1d300" },
        note: "Sắp bắt đầu",
        homeEvents: [],
        awayEvents: [],
        predictions: [
          { name: "Nguyễn Hồng P", pick: "0-2" },
          { name: "Đ. Tuấn", pick: "1-3" },
        ],
      },
      {
        id: "psg-girona",
        competition: "Champions League",
        status: "upcoming",
        kickoff: "03:00",
        home: { name: "PSG", badge: "PSG", color: "#14274e" },
        away: { name: "Girona", badge: "GIR", color: "#e63946" },
        note: "Sắp diễn ra",
        homeEvents: [],
        awayEvents: [],
        predictions: [
          { name: "Phan L. T", pick: "2-1" },
          { name: "Cao Ngọc M", pick: "3-0" },
          { name: "T. Hải", pick: "1-0" },
        ],
      },
    ],
  },
];

// --- APP MAIN COMPONENT ---
export default function App() {
  const [showAuth, setShowAuth] = React.useState(false);
  const [view, setView] = React.useState("bracket");
  const [matchDays, setMatchDays] = React.useState(initialMatchDays);
  const [selectedSection, setSelectedSection] = React.useState(null);
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const isAdmin = user?.role === "admin";

  // Check login state khi load trang
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Kiểm tra token hết hạn chưa
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          return;
        }
        setUser({
          studentId: decoded.sub,
          role: decoded.role,
          fullName: decoded.sub, // Tạm thời hiển thị MSV
        });
        if (decoded.role === "admin") {
          // Nếu đang ở trang khác, có thể tự động chuyển admin (tuỳ chọn)
        }
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

  const handleAddDay = (day) => {
    if (!day?.id || !day?.label) return;
    setMatchDays((prev) => {
      if (prev.some((d) => d.id === day.id)) return prev;
      return [...prev, { ...day, matches: day.matches || [] }];
    });
  };

  const handleUpdateDay = (dayId, updates) => {
    setMatchDays((prev) => prev.map((day) => (day.id === dayId ? { ...day, ...updates } : day)));
  };

  const handleAddMatch = (dayId, match) => {
    if (!dayId || !match) return;
    const matchId = match.id || `${dayId}-${Date.now()}`;
    setMatchDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, matches: [...(day.matches || []), { ...match, id: matchId }] } : day))
    );
  };

  const handleUpdateMatch = (dayId, matchId, updates) => {
    setMatchDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, matches: (day.matches || []).map((m) => (m.id === matchId ? { ...m, ...updates, id: matchId } : m)) }
          : day
      )
    );
    setSelectedMatch((prev) => (prev?.id === matchId ? { ...prev, ...updates, id: matchId } : prev));
  };

  const handleDeleteMatch = (dayId, matchId) => {
    setMatchDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, matches: (day.matches || []).filter((m) => m.id !== matchId) } : day))
    );
    setSelectedMatch((prev) => (prev?.id === matchId ? null : prev));
  };

  // Hàm xử lý Authentication tập trung
  const handleAuthSubmit = async (payload, mode) => {
    try {
      if (mode === "login") {
        // --- LOGIN ---
        // Gọi API login
        const data = await authApi.login({
          msv: payload.studentId,
          password: payload.password
        });
        
        // Lưu token
        localStorage.setItem("token", data.access_token);
        
        // Decode token
        const decoded = jwtDecode(data.access_token);
        const userInfo = {
          studentId: decoded.sub,
          role: decoded.role,
          fullName: decoded.sub, 
        };

        setUser(userInfo);
        setShowAuth(false);
        
        // Chuyển view nếu là admin
        if (decoded.role === "admin") {
          setView("admin");
        }
        
        alert(`Xin chào ${userInfo.studentId}, đăng nhập thành công!`);

      } else {
        // --- REGISTER ---
        // Gọi API register
        await authApi.register({
          msv: payload.studentId,
          full_name: payload.fullName,
          phone: payload.phone,
          password: payload.password
        });
        
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        return true; // Trả về true để AuthModal chuyển tab
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

  React.useEffect(() => {
    const openAuthHandler = () => setShowAuth(true);
    window.addEventListener("openAuth", openAuthHandler);
    return () => window.removeEventListener("openAuth", openAuthHandler);
  }, []);

  React.useEffect(() => {
    if (view === "admin" && !isAdmin) {
      setView("bracket");
    }
  }, [view, isAdmin]);

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
                Đang đăng nhập: <strong>{user.fullName || user.studentId || "Người dùng"}</strong>
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
    const handler = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    if (open) {
      window.addEventListener("keydown", handler);
    }
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset về login mỗi khi mở modal
  React.useEffect(() => {
    if (open) {
      setView("login");
    }
  }, [open]);

  const handleFormSubmit = async (formData) => {
    // Gọi hàm từ App, truyền thêm biến view để biết là đang login hay register
    const success = await onAuthSubmit(formData, view);
    if (success && view === "register") {
      setView("login");
    }
  };

  if (!open) return null;

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <div className="auth-modal__head">
          <div>
            <p className="eyebrow">Football tournament</p>
            <h2>{view === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <section className="auth auth--single">
          {view === "login" ? (
            <div className="auth-card">
              <div className="auth-card__head">
                <p className="eyebrow">Truy cập</p>
                <h3>Đăng nhập</h3>
                <p className="muted">Lưu bracket và đồng bộ dự đoán trên mọi thiết bị.</p>
              </div>
              <AuthForm mode="login" onSubmit={handleFormSubmit} />
              <div className="auth-foot">
                <span>
                  Chưa có tài khoản? {" "}
                  <button type="button" className="link-button" onClick={() => setView("register")}>
                    Đăng ký
                  </button>
                </span>
              </div>
            </div>
          ) : (
            <div className="auth-card auth-card--accent">
              <div className="auth-card__head">
                <p className="eyebrow">Tạo tài khoản</p>
                <h3>Đăng ký</h3>
                <p className="muted">Theo dõi giải đấu, nhận nhắc lịch và chia sẻ đường dẫn dự đoán.</p>
              </div>
              <AuthForm mode="register" onSubmit={handleFormSubmit} />
              <div className="auth-foot">
                <span>
                  Đã có tài khoản? {" "}
                  <button type="button" className="link-button" onClick={() => setView("login")}>
                    Đăng nhập
                  </button>
                </span>
              </div>
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
    
    // Lấy thêm field nếu đăng ký
    const fullName = !isLogin ? (formData.get("fullName") || "").toString().trim() : "";
    const phone = !isLogin ? (formData.get("phone") || "").toString().trim() : "";

    if (!studentId || !password) {
      alert("Vui lòng nhập MSV và mật khẩu");
      return;
    }
    
    // Gửi lên AuthModal
    onSubmit?.({ studentId, fullName, phone, password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>MSV</span>
        <input
          type="text"
          name="studentId"
          className="uppercase-input"
          placeholder="VD: BH01234"
          autoComplete="username"
          required
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
          }}
        />
      </label>

      {!isLogin && (
        <>
          <label className="field">
            <span>Họ và tên</span>
            <input type="text" name="fullName" placeholder="Nguyễn Văn A" autoComplete="name" required />
          </label>

          <label className="field">
            <span>Số điện thoại</span>
            <input type="tel" name="phone" placeholder="09xx xxx xxx" autoComplete="tel" required />
          </label>
        </>
      )}

      <label className="field">
        <span>{isLogin ? "Mật khẩu" : "Tạo mật khẩu"}</span>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />
      </label>

      {!isLogin && (
        <label className="field">
          <span>Nhập lại mật khẩu</span>
          <input type="password" name="confirmPassword" placeholder="••••••••" autoComplete="new-password" />
        </label>
      )}

      {isLogin && (
        <div className="form-row">
          <label className="checkbox">
            <input type="checkbox" name="remember" defaultChecked />
            <span>Ghi nhớ tài khoản</span>
          </label>
          <button type="button" className="link-button">
            Quên mật khẩu?
          </button>
        </div>
      )}

      <button className="primary-btn" type="submit">
        {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
      </button>
    </form>
  );
}

function BracketBoard({ onSectionSelect }) {
  return (
    <section className="board">
      <div className="board-viewport">
        <div className="round-anchor round-anchor--qf" aria-hidden />
        <div className="round-anchor round-anchor--semi" aria-hidden />
        <div className="round-anchor round-anchor--final" aria-hidden />
        <div className="round-anchor round-anchor--champ" aria-hidden />

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
        <div>
          <p className="eyebrow">Trang kết quả</p>
          <h2>Tất cả trận đấu</h2>
          {selectedLabel && <p className="muted">Đang xem nhánh: {selectedLabel}</p>}
        </div>
        <div className="results-actions">
          <button className="primary-btn ghost-btn" type="button" onClick={() => onBack()}>
            Quay lại cây
          </button>
          <button className="primary-btn ghost-btn" type="button" onClick={() => onOpenAuth?.()}>
            Đăng nhập
          </button>
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
  const selectedDay = matchDays[0];
  const [dayLabelDraft, setDayLabelDraft] = React.useState(selectedDay?.label || "");

  React.useEffect(() => {
    setDayLabelDraft(selectedDay?.label || "");
  }, [selectedDay?.id, selectedDay?.label]);

  return (
    <section className="admin-panel">
      <div className="results-header">
        <div>
          <p className="eyebrow">Trang admin</p>
          <h2>Quản lý trận đấu</h2>
        </div>
      </div>

      {selectedDay ? (
        <div className="admin-grid">
          <div className="admin-card">
            <div className="admin-card__head">
              <div>
                <p className="eyebrow">Nhãn</p>
                <h3>{selectedDay.label}</h3>
              </div>
              <span className="muted">{(selectedDay.matches || []).length} trận</span>
            </div>
            <div className="admin-inline-form">
              <label className="field">
                <span>Đổi tên nhãn</span>
                <input type="text" value={dayLabelDraft} onChange={(e) => setDayLabelDraft(e.target.value)} />
              </label>
              <button className="primary-btn ghost-btn" type="button" onClick={() => onUpdateDay?.(selectedDay.id, { label: dayLabelDraft })}>
                Lưu nhãn
              </button>
            </div>
          </div>

          <div className="admin-card admin-card--wide">
            <div className="admin-card__head">
              <h4>Thêm trận mới</h4>
            </div>
            <AdminMatchForm
              submitLabel="Thêm trận"
              onSubmit={(payload) => {
                onAddMatch?.(selectedDay.id, payload);
              }}
            />
          </div>

          <div className="admin-match-list">
            {(selectedDay.matches || []).map((match) => (
              <AdminMatchCard
                key={match.id}
                match={match}
                onUpdate={(payload) => onUpdateMatch?.(selectedDay.id, match.id, payload)}
                onDelete={() => onDeleteMatch?.(selectedDay.id, match.id)}
              />
            ))}
            {(selectedDay.matches || []).length === 0 && <p className="muted">Chưa có trận nào trong nhãn này.</p>}
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <p className="muted">Thêm ngày mới để quản lý trận.</p>
        </div>
      )}
    </section>
  );
}

function AdminMatchCard({ match, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = React.useState(false);

  const statusLabel =
    match.status === "live" ? "Đang diễn ra" : match.status === "ft" ? "Kết thúc" : match.status === "upcoming" ? "Sắp diễn ra" : match.status;

  return (
    <div className="admin-card admin-card--match">
      <div className="admin-card__head">
        <div>
          <p className="eyebrow">{match.competition}</p>
          <strong>
            {match.home?.name} vs {match.away?.name}
          </strong>
          <div className="muted">
            <span>{statusLabel}</span>
            {match.kickoff && <> • {match.kickoff}</>}
            {match.minute && <> • {match.minute}</>}
          </div>
        </div>
        <div className="admin-card__actions">
          <button className="primary-btn ghost-btn" type="button" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? "Huỷ" : "Sửa"}
          </button>
          <button className="primary-btn" type="button" onClick={onDelete}>
            Xóa
          </button>
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
              {match.home?.logo ? <img className="badge-img" src={match.home.logo} alt={`${match.home?.name} logo`} /> : (match.home?.badge || match.home?.name?.[0])}
            </span>
            <span>{match.home?.name}</span>
          </div>
          <div className="admin-score">
            <span>{match.home?.score ?? "-"}</span>
            <span className="dash">-</span>
            <span>{match.away?.score ?? "-"}</span>
          </div>
          <div className="admin-team">
            <span className={`mini-badge ${match.away?.logo ? "mini-badge--logo" : ""}`} style={{ background: match.away?.logo ? "transparent" : match.away?.color || "#e85c5c" }}>
              {match.away?.logo ? <img className="badge-img" src={match.away.logo} alt={`${match.away?.name} logo`} /> : (match.away?.badge || match.away?.name?.[0])}
            </span>
            <span>{match.away?.name}</span>
          </div>
          {match.note && <span className="muted">{match.note}</span>}
        </div>
      )}
    </div>
  );
}

function AdminMatchForm({ initialMatch, submitLabel = "Lưu", onSubmit }) {
  const emptyForm = {
    competition: "",
    status: "upcoming",
    kickoff: "",
    minute: "",
    homeName: "",
    homeLogo: "",
    homeScore: "",
    awayName: "",
    awayLogo: "",
    awayScore: "",
  };

  const toFormState = (match) => ({
    competition: match?.competition || "",
    status: match?.status || "upcoming",
    kickoff: match?.kickoff || "",
    minute: match?.minute || "",
    homeName: match?.home?.name || "",
    homeLogo: match?.home?.logo || "",
    homeScore: match?.home?.score ?? "",
    awayName: match?.away?.name || "",
    awayLogo: match?.away?.logo || "",
    awayScore: match?.away?.score ?? "",
  });

  const [form, setForm] = React.useState(toFormState(initialMatch) || emptyForm);

  React.useEffect(() => {
    setForm(toFormState(initialMatch));
  }, [initialMatch]);

  const parseScore = (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingHomeColor = initialMatch?.home?.color;
    const existingAwayColor = initialMatch?.away?.color;
    const payload = {
      id: initialMatch?.id,
      competition: form.competition || "Friendly",
      status: form.status || "upcoming",
      kickoff: form.kickoff || undefined,
      minute: form.minute || undefined,
      note: initialMatch?.note || "",
      home: {
        name: form.homeName || "Home",
        badge: form.homeName ? form.homeName.slice(0, 3).toUpperCase() : "HOM",
        color: existingHomeColor || "#5bed9f",
        logo: form.homeLogo || undefined,
        score: parseScore(form.homeScore),
      },
      away: {
        name: form.awayName || "Away",
        badge: form.awayName ? form.awayName.slice(0, 3).toUpperCase() : "AWY",
        color: existingAwayColor || "#e85c5c",
        logo: form.awayLogo || undefined,
        score: parseScore(form.awayScore),
      },
      predictions: initialMatch?.predictions || [],
    };
    onSubmit?.(payload);
    if (!initialMatch) {
      setForm(emptyForm);
    }
  };

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => setForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  const handleLogoChange = (field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, [field]: reader.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-row">
        <label className="field">
          <span>Giải đấu</span>
          <input type="text" placeholder="FA Cup" {...bind("competition")} />
        </label>
        <label className="field">
          <span>Trạng thái</span>
          <select className="field-select" {...bind("status")}>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="live">Đang diễn ra</option>
            <option value="ft">Kết thúc</option>
          </select>
        </label>
        <label className="field">
          <span>Giờ bắt đầu</span>
          <input type="text" placeholder="03:30" {...bind("kickoff")} />
        </label>
        <label className="field">
          <span>Phút (nếu live)</span>
          <input type="text" placeholder="45'" {...bind("minute")} />
        </label>
      </div>

      <div className="admin-form-row admin-form-row--teams">
        <div className="admin-team-col">
          <p className="eyebrow">Đội nhà</p>
          <label className="field">
            <span>Tên</span>
            <input type="text" placeholder="Chelsea" {...bind("homeName")} />
          </label>
          <div className="logo-upload">
            <label className="field">
              <span>Logo đội</span>
              <input type="file" accept="image/*" onChange={handleLogoChange("homeLogo")} />
            </label>
            {form.homeLogo && (
              <div className="logo-preview">
                <img src={form.homeLogo} alt="Logo đội nhà" />
              </div>
            )}
          </div>
          <label className="field">
            <span>Tỷ số</span>
            <input type="number" min="0" placeholder="0" {...bind("homeScore")} />
          </label>
        </div>

        <div className="admin-team-col">
          <p className="eyebrow">Đội khách</p>
          <label className="field">
            <span>Tên</span>
            <input type="text" placeholder="Norwich" {...bind("awayName")} />
          </label>
          <div className="logo-upload">
            <label className="field">
              <span>Logo đội</span>
              <input type="file" accept="image/*" onChange={handleLogoChange("awayLogo")} />
            </label>
            {form.awayLogo && (
              <div className="logo-preview">
                <img src={form.awayLogo} alt="Logo đội khách" />
              </div>
            )}
          </div>
          <label className="field">
            <span>Tỷ số</span>
            <input type="number" min="0" placeholder="0" {...bind("awayScore")} />
          </label>
        </div>
      </div>

      <div className="admin-actions-row">
        <button className="primary-btn" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function GameCard({ game, variant, extraClass, onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      className={`game-card game-card--${variant} ${extraClass || ""} ${clickable ? "game-card--link" : ""}`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="game-label">{game.label}</div>
      {game.slots.map((slot, index) => (
        <div key={`${game.id}-slot-${index}`} className="slot">
          <span>{slot}</span>
        </div>
      ))}
    </div>
  );
}

function ChampionCard({ extraClass }) {
  return (
    <div className={`champion-card ${extraClass || ""}`}>
      <div className="cup-icon">
        <div className="cup-bowl" />
        <div className="cup-base" />
      </div>
      <div className="champion-text">
        <span className="eyebrow">Champion</span>
        <strong>Waiting for winner</strong>
      </div>
    </div>
  );
}

function Connector({ className, mode }) {
  const isSemi = mode === "semi";
  const isFinal = mode === "final";
  const viewBox = isSemi ? "0 0 140 400" : isFinal ? "0 0 120 220" : "0 0 140 200";
  let path;

  if (isSemi) {
    path = "M0 100 C 40 100 40 150 80 200 C 40 250 40 300 0 300 M80 200 C 110 200 125 200 140 200";
  } else if (isFinal) {
    path = "M0 110 C 30 110 60 110 120 110";
  } else {
    path = "M0 50 C 35 50 35 70 70 100 C 35 130 35 150 0 150 M70 100 C 100 100 125 100 140 100";
  }

  return (
    <div className={className}>
      <svg viewBox={viewBox} preserveAspectRatio="none" className="connector-svg">
        <path className="connector-path" d={path} />
      </svg>
    </div>
  );
}

function MatchCard({ match, onSelect }) {
  const statusLabel =
    match.status === "live"
      ? `LIVE ${match.minute || ""}`.trim()
      : match.status === "ft"
      ? "End"
      : match.kickoff
      ? `Bắt đầu ${match.kickoff}`
      : "Sắp diễn ra";

  return (
    <article
      className={`match-card match-card--${match.status} ${onSelect ? "match-card--clickable" : ""}`}
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : -1}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="match-meta">
        <span className="competition">{match.competition}</span>
        {match.kickoff && <span className="kickoff">{match.kickoff}</span>}
      </div>

      {match.status !== "ft" && (
        <div className="match-status match-status--center">
          <StatusPill status={match.status} label={statusLabel} />
        </div>
      )}

      <div className="match-main">
        <TeamCell team={match.home} />
        <div className="scoreline">
          <span className="score">{match.home.score ?? "-"}</span>
          <span className="dash">-</span>
          <span className="score">{match.away.score ?? "-"}</span>
        </div>
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
        {hasLogo ? <img className="badge-img" src={team.logo} alt={`${team.name} logo`} /> : <span>{team.badge || team.name.charAt(0)}</span>}
      </div>
      <div className="team-name">{team.name}</div>
    </div>
  );
}

function StatusPill({ status, label }) {
  return <span className={`status-pill status-pill--${status}`}>{label}</span>;
}

function MatchDetailModal({ match, onClose }) {
  const totalPred = (match.predictions || []).length;
  const outcomeSummary = (match.predictions || []).reduce(
    (acc, p) => {
      if (!p.pick || !p.pick.includes("-")) return acc;
      const [h, a] = p.pick.split("-").map((v) => parseInt(v.trim(), 10));
      if (Number.isNaN(h) || Number.isNaN(a)) return acc;
      if (h > a) acc.home += 1;
      else if (h < a) acc.away += 1;
      else acc.draw += 1;
      return acc;
    },
    { home: 0, draw: 0, away: 0 }
  );
  const homeRaw = totalPred ? (outcomeSummary.home / totalPred) * 100 : 0;
  const drawRaw = totalPred ? (outcomeSummary.draw / totalPred) * 100 : 0;
  const awayRaw = totalPred ? (outcomeSummary.away / totalPred) * 100 : 0;
  let homePct = Math.round(homeRaw);
  let drawPct = Math.round(drawRaw);
  let awayPct = Math.round(awayRaw);
  const remainder = 100 - (homePct + drawPct + awayPct);
  if (remainder !== 0) {
    const maxVal = Math.max(homeRaw, drawRaw, awayRaw);
    if (maxVal === homeRaw) homePct += remainder;
    else if (maxVal === drawRaw) drawPct += remainder;
    else awayPct += remainder;
  }
  const [homePick, setHomePick] = React.useState("");
  const [awayPick, setAwayPick] = React.useState("");

  const maskName = (name) => {
    if (!name) return "";
    if (name.length <= 2) return name[0] + "*";
    const first = name.slice(0, 2);
    const last = name.slice(-1);
    return `${first}${"*".repeat(Math.max(1, name.length - 3))}${last}`;
  };

  const renderEvents = (events) =>
    events && events.length > 0 ? (
      events.map((ev, idx) => (
        <div key={`${ev.time}-${idx}`} className="event-item">
          <span className="event-time">{ev.time}</span>
          <span className="event-player">{ev.player}</span>
        </div>
      ))
    ) : (
      <span className="muted">Chưa có bàn thắng</span>
    );

  return (
    <div className="match-detail-backdrop" role="dialog" aria-modal="true">
      <div className="match-detail">
        <div className="match-detail__head">
          <div>
            <p className="eyebrow">{match.competition}</p>
            <h3>
              {match.home.name} vs {match.away.name}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="match-detail__body">
          <div className="match-detail__teams">
            <TeamCell team={match.home} />
            <div className="scoreline scoreline--lg">
              <span className="score">{match.home.score ?? "-"}</span>
              <span className="dash">-</span>
              <span className="score">{match.away.score ?? "-"}</span>
            </div>
            <TeamCell team={match.away} align="right" />
          </div>
          <div className="match-detail__meta">
            <StatusPill status={match.status} label={match.status === "live" ? `LIVE ${match.minute || ""}`.trim() : match.status === "ft" ? "Kết thúc" : match.kickoff ? `Bắt đầu ${match.kickoff}` : "Sắp diễn ra"} />
            {match.note && <span className="status-note">{match.note}</span>}
          </div>
          <div className="match-detail__events">
            <div>
              <p className="eyebrow">Đội nhà</p>
              {renderEvents(match.homeEvents || [])}
            </div>
            <div>
              <p className="eyebrow">Đội khách</p>
              {renderEvents(match.awayEvents || [])}
            </div>
          </div>
          <div className="predict-list">
            <div className="predict-list__head">
              <p className="eyebrow">Người dự đoán</p>
              <span className="muted">{totalPred} người</span>
            </div>
            <div className="predict-list__body">
              {(match.predictions || []).map((p, idx) => (
                <div key={`${p.name}-${idx}`} className="predict-item">
                  <span>{maskName(p.name)}</span>
                  {p.pick && <span className="muted">{p.pick}</span>}
                </div>
              ))}
              {(match.predictions || []).length === 0 && <span className="muted">Chưa có dự đoán</span>}
            </div>
            {totalPred > 0 && (
              <div className="predict-summary">
                <p className="eyebrow">Tỷ lệ dự đoán</p>
                <div className="predict-bar predict-bar--stack">
                  <div className="predict-segment predict-segment--home" style={{ width: `${homePct}%` }}>
                    {homePct > 8 && <span>{homePct}%</span>}
                  </div>
                  <div className="predict-segment predict-segment--draw" style={{ width: `${drawPct}%` }}>
                    {drawPct > 8 && <span>{drawPct}%</span>}
                  </div>
                  <div className="predict-segment predict-segment--away" style={{ width: `${awayPct}%` }}>
                    {awayPct > 8 && <span>{awayPct}%</span>}
                  </div>
                </div>
                <div className="predict-summary__legend">
                  <span className="legend-dot legend-dot--home" /> Chủ thắng ({homePct}%)
                  <span className="legend-dot legend-dot--draw" /> Hòa ({drawPct}%)
                  <span className="legend-dot legend-dot--away" /> Khách thắng ({awayPct}%)
                </div>
              </div>
            )}
          </div>
          <div className="predict-input">
            <p className="eyebrow">Dự đoán của bạn</p>
            <div className="predict-input__row">
              <div className="predict-team predict-team--left">
                <span className={`mini-badge ${match.home.logo ? "mini-badge--logo" : ""}`} style={{ background: match.home.logo ? "transparent" : match.home.color || "#5bed9f" }}>
                  {match.home.logo ? <img className="badge-img" src={match.home.logo} alt={`${match.home.name} logo`} /> : (match.home.badge || match.home.name[0])}
                </span>
                <span className="predict-team__name">{match.home.name}</span>
              </div>
              <input
                className="predict-score"
                type="number"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                value={homePick}
                onChange={(e) => setHomePick(e.target.value)}
                aria-label="Tỷ số đội nhà"
              />
              <span className="predict-input__dash">-</span>
              <input
                className="predict-score"
                type="number"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                value={awayPick}
                onChange={(e) => setAwayPick(e.target.value)}
                aria-label="Tỷ số đội khách"
              />
              <div className="predict-team predict-team--right">
                <span className={`mini-badge ${match.away.logo ? "mini-badge--logo" : ""}`} style={{ background: match.away.logo ? "transparent" : match.away.color || "#e85c5c" }}>
                  {match.away.logo ? <img className="badge-img" src={match.away.logo} alt={`${match.away.name} logo`} /> : (match.away.badge || match.away.name[0])}
                </span>
                <span className="predict-team__name">{match.away.name}</span>
              </div>
            </div>
          </div>
          <div className="predict-action">
            <button
              className="primary-btn predict-btn"
              type="button"
              disabled={match.status === "ft"}
              onClick={() => {
                if (match.status === "ft") return;
                window.alert("Bạn đã chọn Dự đoán tỷ số. (Placeholder hành động)");
              }}
            >
              Dự đoán tỷ số
            </button>
            {match.status === "ft" && <span className="muted">Trận đã kết thúc - không nhận dự đoán.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomCta({ onClick }) {
  return (
    <div className="bottom-cta">
      <button className="primary-btn bottom-cta__btn" type="button" onClick={onClick}>
        Mở trang kết quả
      </button>
    </div>
  );
}
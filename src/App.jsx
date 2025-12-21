import React from "react";
import { jwtDecode } from "jwt-decode";
import authApi from "./api/authApi";   // Import API module
import matchApi from "./api/matchApi"; // Import Match API
import userAdminApi from "./api/userAdminApi";
import teamsApi from "./api/teamsApi"; // Import Teams API
import logoLeft from "./images/Logo-BTEC.png";
import logoCenter from "./images/Logo Bong Da.png";
import logoRight from "./images/logo-mel.png";

// --- TOAST CONTEXT & COMPONENT ---
const ToastContext = React.createContext(null);

function useToast() {
  return React.useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const showToast = React.useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "info" && "ℹ"}
              {toast.type === "warning" && "⚠"}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- LOGIN PROMPT MODAL ---
function LoginPromptModal({ open, onClose, onLogin, onRegister, message }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card login-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="login-prompt-content">
          <div className="login-prompt-icon">🔐</div>
          <h3>Yêu cầu đăng nhập</h3>
          <p className="login-prompt-message">{message || "Bạn cần đăng nhập để thực hiện thao tác này."}</p>
          <div className="login-prompt-actions">
            <button className="primary-btn" onClick={onLogin}>
              Đăng nhập
            </button>
            <button className="primary-btn ghost-btn" onClick={onRegister}>
              Đăng ký tài khoản
            </button>
          </div>
          <p className="login-prompt-note">
            Chưa có tài khoản? Đăng ký ngay để tham gia dự đoán!
          </p>
        </div>
      </div>
    </div>
  );
}

// --- CONFIRM MODAL ---
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy", danger = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="confirm-modal-content">
          <div className="confirm-modal-icon">{danger ? "⚠️" : "❓"}</div>
          <h3>{title || "Xác nhận"}</h3>
          <p>{message}</p>
          <div className="confirm-modal-actions">
            <button className="secondary-btn" onClick={onClose}>
              {cancelText}
            </button>
            <button className={`primary-btn ${danger ? 'danger-btn' : ''}`} onClick={() => { onConfirm(); onClose(); }}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

const TEAMS = [
  { name: "TBD", logo: "" },
  { name: "All Star BTEC", logo: "" },
  { name: "Dừa FC", logo: "" },
  { name: "F+", logo: "" },
  { name: "FC Thanh Triều", logo: "" },
  { name: "Galacticos", logo: "" },
  { name: "Lũ Quỷ Thành Mân", logo: "" },
  { name: "Max FC", logo: "" },
  { name: "Melbourne FPI", logo: "" },
  { name: "The Fix FC", logo: "" },
  { name: "Trẻ Mel", logo: "" },
  { name: "TĐ&AE", logo: "" },
  { name: "Đội Văn Bóng", logo: "" },
];

const COMPETITION_OPTIONS = [
  "Bảng A - Sân 1", "Bảng A - Sân 2", "Bảng A - Sân 3", "Bảng A - Sân 4",
  "Bảng B - Sân 1", "Bảng B - Sân 2", "Bảng B - Sân 3", "Bảng B - Sân 4",
  "Bảng C - Sân 1", "Bảng C - Sân 2", "Bảng C - Sân 3", "Bảng C - Sân 4",
  "Bảng D - Sân 1", "Bảng D - Sân 2", "Bảng D - Sân 3", "Bảng D - Sân 4",
  "Tứ kết 1 - Sân 1", "Tứ kết 2 - Sân 2", "Tứ kết 3 - Sân 3", "Tứ kết 4 - Sân 4",
  "Bán kết 1 - Sân 1", "Bán kết 2 - Sân 2",
  "Tranh hạng 3 - Sân 1",
  "Chung kết - Sân 1"
];

const quarterGames = [
  { id: "g1", label: "Bảng A", slots: ["Đội Văn Bóng", "TĐ&AE", "The Fix FC"] },
  { id: "g2", label: "Bảng B", slots: ["FC Thanh Triều", "Galacticos", "Lũ Quỷ Thành Mân"] },
  { id: "g3", label: "Bảng C", slots: ["Trẻ Mel", "Max FC", "F+"] },
  { id: "g4", label: "Bảng D", slots: ["Dừa FC", "All Star BTEC", "Melbourne FPI"] },
];

const knockoutQuarterGames = [
  { id: "qf1", label: "Tứ kết 1", slots: ["The Fix FC", "FC Thanh Triều"] },
  { id: "qf2", label: "Tứ kết 2", slots: ["Galacticos", "TD & AE"] },
  { id: "qf3", label: "Tứ kết 3", slots: ["Max FC", "All Star BTEC"] },
  { id: "qf4", label: "Tứ kết 4", slots: ["Melbourne FPI", "Trẻ Mel"] },
];

const semiGames = [
  { id: "g5", label: "Bán kết 1", slots: ["FC Thanh Triều", "Galacticos"], connectorHeight: 94 },
  { id: "g6", label: "Bán kết 2", slots: ["Max FC", "Melbourne FPI"], connectorHeight: 94 },
];

const finalGames = [
  { id: "g8", label: "Tranh hạng Ba", slots: ["FC Thanh Triều", "Melbourne FPI"], connectorHeight: 94 },
  { id: "g7", label: "Chung kết", slots: ["Max FC", "Galacticos"], connectorHeight: 188 },
];

const sectionMatches = {
  g1: { label: "Bảng A", stage: "group", group: "A" },
  g2: { label: "Bảng B", stage: "group", group: "B" },
  g3: { label: "Bảng C", stage: "group", group: "C" },
  g4: { label: "Bảng D", stage: "group", group: "D" },
  qf1: { label: "Tứ kết 1", stage: "quarter", match_code: "QF1" },
  qf2: { label: "Tứ kết 2", stage: "quarter", match_code: "QF2" },
  qf3: { label: "Tứ kết 3", stage: "quarter", match_code: "QF3" },
  qf4: { label: "Tứ kết 4", stage: "quarter", match_code: "QF4" },
  g5: { label: "Bán kết 1", stage: "semi", match_code: "SF1" },
  g6: { label: "Bán kết 2", stage: "semi", match_code: "SF2" },
  g7: { label: "Chung kết", stage: "final", match_code: "F1" },
  g8: { label: "Tranh hạng Ba", stage: "final", match_code: "F2" },
};



// Helper format kickoff dạng dd/mm hh:ii
const formatKickoffFull = (dateStr, kickoff) => {
  if (!dateStr && !kickoff) return "";

  // Nếu có start_time dạng ISO
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month} ${hour}:${min}`;
    }
  }

  // Nếu chỉ có kickoff dạng hh:mm, kết hợp với date nếu có
  return kickoff || "";
};

const transformMatchesToDays = (matches) => {
  if (!Array.isArray(matches)) return [];

  // Sắp xếp tất cả matches theo thời gian (gần nhất lên đầu)
  const sortedMatches = [...matches].sort((a, b) => {
    const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
    const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
    const now = Date.now();

    // Ưu tiên: trận đang diễn ra > trận sắp tới > trận đã kết thúc
    const statusA = a.status || (a.is_locked ? "ft" : "upcoming");
    const statusB = b.status || (b.is_locked ? "ft" : "upcoming");

    const getPriority = (status, time) => {
      if (status === "live") return 0;
      if (status === "upcoming" && time >= now) return 1;
      return 2;
    };

    const priorityA = getPriority(statusA, timeA);
    const priorityB = getPriority(statusB, timeB);

    if (priorityA !== priorityB) return priorityA - priorityB;

    // Cùng priority thì sắp xếp theo thời gian
    // Upcoming: gần nhất trước; đã xong: mới nhất trước
    if (priorityA <= 1) return timeA - timeB; // Sắp tới: gần nhất lên trước
    return timeB - timeA; // Đã kết thúc: mới nhất lên trước
  });

  const grouped = sortedMatches.reduce((acc, match) => {
    const dateKey = match.date || (match.start_time ? match.start_time.split("T")[0] : "unknown");
    if (!acc[dateKey]) acc[dateKey] = [];

    // Format kickoff dạng dd/mm hh:ii
    const kickoffDisplay = formatKickoffFull(match.start_time, match.kickoff);

    acc[dateKey].push({
      id: match.id,
      competition: match.competition,
      status: match.status || (match.is_locked ? "ft" : "upcoming"),
      events: match.events || [],
      kickoff: kickoffDisplay,
      rawKickoff: match.kickoff,
      minute: match.minute,
      date: dateKey,
      start_time: match.start_time,
      home: { name: match.team_a, score: match.score_a, logo: match.team_a_logo, color: match.team_a_color },
      away: { name: match.team_b, score: match.score_b, logo: match.team_b_logo, color: match.team_b_color },
      predictions: match.predictions || [],
      stage: match.stage,
      group: match.group,
      match_code: match.match_code
    });
    return acc;
  }, {});

  // Sắp xếp ngày theo thứ tự gần nhất
  const sortedDays = Object.keys(grouped).sort((a, b) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    const now = Date.now();

    // Ngày có trận sắp tới/đang diễn ra lên đầu
    const hasUpcomingA = grouped[a].some(m => m.status === "live" || m.status === "upcoming");
    const hasUpcomingB = grouped[b].some(m => m.status === "live" || m.status === "upcoming");

    if (hasUpcomingA && !hasUpcomingB) return -1;
    if (!hasUpcomingA && hasUpcomingB) return 1;

    // Cùng loại thì sắp xếp: upcoming theo gần nhất, ft theo mới nhất
    if (hasUpcomingA) return dateA - dateB;
    return dateB - dateA;
  });

  return sortedDays.map(dateKey => {
    const dateObj = new Date(dateKey);
    const label = dateObj.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return { id: dateKey, label: label, matches: grouped[dateKey] };
  });
};

// --- APP MAIN COMPONENT ---
export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const { showToast } = useToast();
  const [showAuth, setShowAuth] = React.useState(false);
  const [authMode, setAuthMode] = React.useState("login"); // "login" or "register"
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = React.useState("");
  // Confirm Modal state
  const [confirmModal, setConfirmModal] = React.useState({ open: false, title: "", message: "", onConfirm: null, danger: false });
  const [view, setView] = React.useState("results");
  const [matchDays, setMatchDays] = React.useState([]); // Bắt đầu với mảng rỗng
  const [selectedSection, setSelectedSection] = React.useState(null);
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [matchModalTab, setMatchModalTab] = React.useState("info");
  const [user, setUser] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [publicTab, setPublicTab] = React.useState("bracket");
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [teams, setTeams] = React.useState([]); // Danh sách các đội từ database

  const [myPredictions, setMyPredictions] = React.useState({});

  // Fetch teams from database
  const fetchTeams = React.useCallback(async () => {
    try {
      const data = await teamsApi.getAll();
      setTeams(data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  }, []);

  const isAdmin = user?.role === "admin";

  // Helper function để yêu cầu đăng nhập
  const requireLogin = React.useCallback((message) => {
    setLoginPromptMessage(message || "Bạn cần đăng nhập để thực hiện thao tác này.");
    setShowLoginPrompt(true);
  }, []);

  // Helper function để hiển thị confirm modal
  const showConfirm = React.useCallback((options) => {
    setConfirmModal({ open: true, ...options });
  }, []);

  const closeConfirm = React.useCallback(() => {
    setConfirmModal(prev => ({ ...prev, open: false }));
  }, []);

  const handleLoginFromPrompt = () => {
    setShowLoginPrompt(false);
    setAuthMode("login");
    setShowAuth(true);
  };

  const handleRegisterFromPrompt = () => {
    setShowLoginPrompt(false);
    setAuthMode("register");
    setShowAuth(true);
  };

  // Fetch user predictions
  const fetchMyPredictions = React.useCallback(async () => {
    if (!user) {
      setMyPredictions({});
      return;
    }
    try {
      const list = await matchApi.getMyPredictions();
      const map = list.reduce((acc, p) => ({ ...acc, [p.match_id]: p }), {});
      setMyPredictions(map);
    } catch (error) {
      console.error("Failed to load my predictions:", error);
    }
  }, [user]);

  // Fetch match list and hydrate events from detail API so admin view stays in sync
  const fetchMatchesWithEvents = React.useCallback(async () => {
    let matches = [];
    try {
      matches = await matchApi.getAllMatches();
    } catch (error) {
      console.error("Failed to load matches:", error);
      setMatchDays({});
      return;
    }
    setMatchDays(transformMatchesToDays(matches));
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

  // 1. Fetch dữ liệu trận đấu và bảng điểm khi load trang cho mọi người
  React.useEffect(() => {
    fetchMatchesWithEvents();
    fetchLeaderboard();
  }, [fetchMatchesWithEvents, fetchLeaderboard]);

  // 2. Fetch my predictions khi user login
  React.useEffect(() => {
    fetchMyPredictions();
  }, [fetchMyPredictions]);

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

  // 2. HTTP Polling để nhận điểm số (Thay thế WebSocket)
  React.useEffect(() => {
    console.log("Starting HTTP Polling for live scores...");
    const interval = setInterval(() => {
      fetchMatchesWithEvents();
      fetchLeaderboard();
    }, 30000); // 30 giây pull 1 lần

    return () => clearInterval(interval);
  }, [fetchMatchesWithEvents, fetchLeaderboard]);

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
          fullName: decoded.full_name || decoded.sub,
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

  // 4. Global Event Listener for 401 Unauthorized
  React.useEffect(() => {
    const handleUnauthorized = (event) => {
      const msg = event.detail?.message || "Vui lòng đăng nhập để tiếp tục";
      setUser(null); // Clear user state
      requireLogin(msg);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [requireLogin]);

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
        showToast(`Xin chào ${userInfo.studentId}, đăng nhập thành công!`, "success");

      } else {
        await authApi.register({
          msv: payload.studentId,
          full_name: payload.fullName,
          phone: payload.phone,
          password: payload.password
        });
        showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
        return true;
      }
    } catch (error) {
      console.error("Auth failed:", error);
      const msg = error.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.";
      showToast(msg, "error");
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
              <img src={logoLeft} alt="FPT Polytechnic International Logo" className="hero-logo" />
              <img src={logoCenter} alt="Football Championship 2025" className="hero-logo hero-logo--main" />
              <img src={logoRight} alt="Melbourne Polytechnic Logo" className="hero-logo" />
            </div>
            <div className="hero-text">
              <h1 className="hero-title">FOOTBALL CHAMPIONSHIP 2025</h1>
              <p className="hero-subtitle">Giải bóng đá sinh viên FPT Polytechnic International</p>
            </div>
            <div className="sponsor-strip">
              <span className="sponsor-label">Tài trợ bởi:</span>
              <span className="sponsor-name">FPT Polytechnic International</span>
            </div>
          </div>
        </header>

        {/* User Status Badge - Góc phải trên - Bấm để đăng xuất */}
        {user && (
          <div
            className="user-status-badge"
            onClick={handleLogout}
            title="Bấm để đăng xuất"
            style={{
              position: "fixed",
              top: 12,
              right: 12,
              background: "rgba(10, 44, 29, 0.9)",
              backdropFilter: "blur(8px)",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              color: "#5bed9f",
              fontWeight: 600,
              zIndex: 1000,
              border: "1px solid rgba(91, 237, 159, 0.3)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(91, 237, 159, 0.2)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(10, 44, 29, 0.9)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            👤 {user.fullName || user.studentId} <span style={{ opacity: 0.7, marginLeft: 4 }}>✕</span>
          </div>
        )}

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
              teams={teams}
              onRefreshUsers={loadUsers}
              onRefreshTeams={fetchTeams}
              onUpdateDay={handleUpdateDay}
              onAddMatch={handleAddMatch}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
              onReloadMatches={reloadMatches}
              showToast={showToast}
              showConfirm={showConfirm}
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
                onClick={() => {
                  setPublicTab("results");
                }}
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
              <section className="section-block">
                <ResultsFeed
                  matchDays={matchDays}
                  selectedLabel={selectedLabel}
                  selectedSection={selectedSection}
                  user={user}
                  onLogout={handleLogout}
                  onOpenAuth={() => { setAuthMode("login"); setShowAuth(true); }}
                  onSelectMatch={handleOpenMatch}
                  onPredictMatch={handleOpenMatch}
                  showAll={!selectedSection}
                  onClearFilter={() => handleSectionSelect(null)}
                  autoScrollToNearest={true}
                  myPredictions={myPredictions}
                />
              </section>
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
            onClose={() => setSelectedMatch(null)}
            showToast={showToast}
            onRequestLogin={() => setView("login")}
          />
        )}
        <LoginPromptModal
          open={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={handleLoginFromPrompt}
          onRegister={handleRegisterFromPrompt}
          message={loginPromptMessage}
        />
        <ConfirmModal
          open={confirmModal.open}
          onClose={closeConfirm}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          danger={confirmModal.danger}
        />
      </main>
    </div >
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

function AuthForm({ mode, onSubmit, onError }) {
  const isLogin = mode === "login";
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentId = (formData.get("studentId") || "").toString().trim();
    const password = (formData.get("password") || "").toString().trim();
    const fullName = !isLogin ? (formData.get("fullName") || "").toString().trim() : "";
    const phone = !isLogin ? (formData.get("phone") || "").toString().trim() : "";

    if (!studentId || !password) {
      onError?.("Vui lòng nhập MSV và mật khẩu");
      return;
    }
    onSubmit?.({ studentId, fullName, phone, password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      <label className="field">
        <span>MSV</span>
        <input
          type="text"
          name="studentId"
          className="uppercase-input"
          placeholder="VD: BH01234"
          required
          autoComplete="off"
          onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
        />
      </label>
      {!isLogin && (
        <>
          <label className="field"><span>Họ và tên</span><input type="text" name="fullName" required autoComplete="off" /></label>
          <label className="field"><span>Số điện thoại</span><input type="tel" name="phone" required autoComplete="off" /></label>
        </>
      )}
      <label className="field"><span>{isLogin ? "Mật khẩu" : "Tạo mật khẩu"}</span><input type="password" name="password" required autoComplete="new-password" /></label>
      <button className="primary-btn" type="submit">{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</button>
    </form>
  );
}

// --- COMPONENT: BẢNG XẾP HẠNG CÁC BẢNG ĐẤU ---
function BracketBoard({ onSectionSelect }) {
  const viewportRef = React.useRef(null);
  const [activeRound, setActiveRound] = React.useState(0);
  const rounds = ["group", "quarter", "semi", "final", "champ"];
  const roundLabels = ["Vòng bảng", "Tứ kết", "Bán kết", "Chung kết", "Vô địch"];

  const scrollToRound = (index) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const anchor = viewport.querySelector(`.round-anchor--${rounds[index]}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setActiveRound(index);
    }
  };

  // Detect which round is visible on scroll
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const scrollLeft = viewport.scrollLeft;
      const viewWidth = viewport.clientWidth;
      // Approximate column positions
      const colGame = 220;
      const colGap = 60;
      const thresholds = [
        0,
        colGame + colGap,
        (colGame + colGap) * 2,
        (colGame + colGap) * 3,
        (colGame + colGap) * 4
      ];

      let newActive = 0;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (scrollLeft >= thresholds[i] - viewWidth / 3) {
          newActive = i;
          break;
        }
      }
      setActiveRound(newActive);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="board">
      <div className="bracket-nav">
        {roundLabels.map((label, idx) => (
          <button
            key={rounds[idx]}
            type="button"
            className={`bracket-nav-btn ${activeRound === idx ? "is-active" : ""}`}
            onClick={() => scrollToRound(idx)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="board-viewport" ref={viewportRef}>
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
          <GameCard game={finalGames[0]} variant="third" extraClass="pos-third" onClick={() => onSectionSelect("g8")} />
          <GameCard game={finalGames[1]} variant="final" extraClass="pos-f" onClick={() => onSectionSelect("g7")} />
          <ChampionCard extraClass="pos-champion" />
          <SecondPlaceCard extraClass="pos-second" />
          <ThirdPlaceCard extraClass="pos-third-prize" />
          <Connector className="connector connector-gq-top" mode="cross" />
          <Connector className="connector connector-gq-bottom" mode="cross" />
          <Connector className="connector connector-q12" mode="q" />
          <Connector className="connector connector-q34" mode="q" />
          <Connector className="connector connector-semis" mode="semi" />
          <Connector className="connector connector-final" mode="final" />
          <div className="round-label round-label--group">Vòng bảng</div>
          <div className="round-label round-label--quarter">Tứ kết</div>
          <div className="round-label round-label--semi">Bán kết</div>
          <div className="round-label round-label--final">Chung kết</div>
          <div className="round-label round-label--champ">Vô địch</div>
        </div>
      </div>
      <div className="bracket-scroll-hint">
        <span>← Vuốt để xem các vòng đấu →</span>
      </div>
    </section>
  );
}

function ResultsFeed({ matchDays = [], selectedLabel, selectedSection, onSelectMatch, onPredictMatch, onOpenAuth, user, onLogout, showAll = false, onClearFilter, autoScrollToNearest = false, myPredictions = {} }) {
  const containerRef = React.useRef(null);
  const nearestMatchRef = React.useRef(null);

  const formatDay = (dateStr, fallbackLabel) => {
    const d = dateStr ? new Date(dateStr) : null;
    if (!d || Number.isNaN(d.getTime())) return { full: fallbackLabel || "-", short: "", numeric: "" };
    return {
      full: d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      short: d.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase(),
      numeric: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };
  };

  // Lọc matches dựa trên selectedSection
  const filteredMatchDays = React.useMemo(() => {
    if (!selectedSection || showAll) return matchDays;

    const sectionConfig = sectionMatches[selectedSection];
    if (!sectionConfig) return matchDays;

    return matchDays.map(day => {
      const filteredMatches = (day.matches || []).filter(match => {
        // Filter theo stage và group/match_code
        if (sectionConfig.stage && match.stage !== sectionConfig.stage) return false;
        if (sectionConfig.group && match.group !== sectionConfig.group) return false;
        if (sectionConfig.match_code && match.match_code !== sectionConfig.match_code) return false;
        return true;
      });
      return { ...day, matches: filteredMatches };
    }).filter(day => day.matches.length > 0);
  }, [matchDays, selectedSection, showAll]);

  // Tìm trận gần nhất (đang diễn ra hoặc sắp diễn ra)
  const nearestMatchId = React.useMemo(() => {
    let nearestMatch = null;
    const now = Date.now();

    for (const day of filteredMatchDays) {
      for (const match of day.matches || []) {
        // Ưu tiên trận đang diễn ra
        if (match.status === "live") {
          return match.id;
        }
        // Trận sắp diễn ra gần nhất
        if (match.status === "upcoming") {
          const matchTime = match.start_time ? new Date(match.start_time).getTime() : 0;
          if (!nearestMatch || matchTime < new Date(nearestMatch.start_time).getTime()) {
            nearestMatch = match;
          }
        }
      }
    }
    return nearestMatch?.id || null;
  }, [filteredMatchDays]);

  // Auto scroll đến trận gần nhất
  React.useEffect(() => {
    if (autoScrollToNearest && nearestMatchId && nearestMatchRef.current) {
      setTimeout(() => {
        nearestMatchRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    }
  }, [autoScrollToNearest, nearestMatchId]);

  return (
    <section className="results">
      <div className="results-header">
        <div>
          <p className="eyebrow">Trang kết quả</p>
          <h2>{selectedLabel ? `Trận đấu: ${selectedLabel}` : "Tất cả trận đấu"}</h2>
          {selectedLabel && (
            <p className="muted">Đang xem nhánh: {selectedLabel}</p>
          )}
        </div>
        <div className="results-actions">
          {selectedLabel && onClearFilter && (
            <button className="primary-btn ghost-btn" type="button" onClick={onClearFilter} style={{ marginRight: 8 }}>
              Xem tất cả
            </button>
          )}
          {!user && (
            <button className="primary-btn ghost-btn" type="button" onClick={() => onOpenAuth?.()}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
      <div className="match-days">
        {filteredMatchDays.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
            {selectedLabel ? `Chưa có trận đấu nào cho ${selectedLabel}` : "Chưa có trận đấu nào"}
          </div>
        ) : (
          filteredMatchDays.map((day) => (
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
                {(day.matches || []).map((match) => {
                  const isNearest = match.id === nearestMatchId;
                  return (
                    <div
                      key={match.id}
                      ref={isNearest ? nearestMatchRef : null}
                      className={isNearest ? "nearest-match-highlight" : ""}
                    >
                      <MatchCard
                        match={match}
                        onSelect={() => onSelectMatch?.(match)}
                        onPredict={() => onPredictMatch?.(match)}
                        user={user}
                        onOpenAuth={onOpenAuth}
                        myPredictions={myPredictions}
                      />
                    </div>
                  );
                })}
              </div>
            </article>
          ))
        )}
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
          <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Dự đoán để cùng nhận những phần thưởng giá trị nhé!
          </p>
        </div>
      </div>
      {displayLeaderboard.length === 0 ? (
        <div className="results-empty">Chưa có dữ liệu dự đoán.</div>
      ) : (
        <div className="match-list">
          {displayLeaderboard.map((item, idx) => (
            <div key={`${item.name}-${item.rank || idx}`} className="match-card leaderboard-card">
              <div className="leaderboard-rank">
                <span className={`rank-badge ${(item.rank || idx + 1) <= 3 ? `rank-top-${item.rank || idx + 1}` : ''}`}>
                  {item.rank || idx + 1}
                </span>
              </div>
              <div className="leaderboard-info">
                <strong className="leaderboard-name">{item.name}</strong>
                {item.total != null && (
                  <span className="leaderboard-meta">
                    {item.total} dự đoán
                    {item.totalTimeSeconds != null && item.totalTimeSeconds > 0 && (
                      <> · Sớm: {formatTimeGap(item.totalTimeSeconds)}</>
                    )}
                  </span>
                )}
              </div>
              <div className="leaderboard-points">
                <span className="points-value">{item.points}</span>
                <span className="points-label">điểm</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ matchDays = [], users = [], teams = [], onRefreshUsers, onRefreshTeams, onUpdateDay, onAddMatch, onUpdateMatch, onDeleteMatch, onReloadMatches, showToast, showConfirm }) {
  // Hàm xử lý gọi API chung để không phải reload trang
  const handleApiAction = async (promise, onSuccess) => {
    try {
      await promise;
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast?.(error.response?.data?.detail || error.message, "error");
    }
  };

  const [section, setSection] = React.useState("matches");
  const isNarrow = useIsNarrow(768);

  // Auto refresh teams when opening admin panel
  React.useEffect(() => {
    onRefreshTeams?.();
  }, []);

  // Team form state
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamLogo, setNewTeamLogo] = React.useState("");
  const [editingTeam, setEditingTeam] = React.useState(null);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      showToast?.("Vui lòng nhập tên đội", "warning");
      return;
    }
    try {
      await teamsApi.create({ name: newTeamName.trim(), logo: newTeamLogo });
      showToast?.("Đã thêm đội mới!", "success");
      setNewTeamName("");
      setNewTeamLogo("");
      onRefreshTeams?.();
    } catch (err) {
      showToast?.(err.response?.data?.detail || err.message, "error");
    }
  };

  const handleUpdateTeam = async (teamId, data) => {
    try {
      await teamsApi.update(teamId, data);
      showToast?.("Đã cập nhật đội!", "success");
      setEditingTeam(null);
      onRefreshTeams?.();
    } catch (err) {
      showToast?.(err.response?.data?.detail || err.message, "error");
    }
  };

  const handleDeleteTeam = (team) => {
    showConfirm({
      title: "Xóa đội",
      message: `Bạn có chắc muốn xóa đội "${team.name}"?`,
      danger: true,
      onConfirm: async () => {
        try {
          await teamsApi.delete(team.id);
          showToast?.("Đã xóa đội!", "success");
          onRefreshTeams?.();
        } catch (err) {
          showToast?.(err.response?.data?.detail || err.message, "error");
        }
      }
    });
  };

  const sectionTitle = section === "matches" ? "Quản lý trận đấu" : section === "users" ? "Quản lý user" : "Quản lý đội";

  return (
    <section className="admin-panel" style={isNarrow ? { padding: "12px 10px 24px", maxWidth: "540px", width: "100%", margin: "0 auto", boxSizing: "border-box", overflowX: "hidden" } : {}}>
      <div className="results-header">
        <div><p className="eyebrow">Trang admin</p><h2>{sectionTitle}</h2></div>
        <div className="feed-tabs">
          <button className={`feed-tab ${section === "matches" ? "is-active" : ""}`} onClick={() => setSection("matches")}>Trận đấu</button>
          <button className={`feed-tab ${section === "teams" ? "is-active" : ""}`} onClick={() => { setSection("teams"); onRefreshTeams?.(); }}>Đội</button>
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
                teams={teams}
                onSubmit={(payload) => {
                  import('./api/adminApi').then(mod => {
                    handleApiAction(
                      mod.default.createMatch(payload),
                      () => {
                        showToast?.("Đã thêm trận mới!", "success");
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
                    <h5 className="eyebrow" style={{ margin: "10px 0", color: "#5bed9f", borderBottom: "1px solid #333" }}>
                      {day.label}
                    </h5>
                    {(day.matches || []).map((match) => (
                      <AdminMatchCard
                        key={match.id}
                        match={match}
                        teams={teams}
                        onToast={showToast}
                        onUpdate={(payload) => {
                          import('./api/adminApi').then(mod => {
                            handleApiAction(
                              mod.default.updateMatch(match.id, payload),
                              () => { onUpdateMatch?.(day.id, match.id, payload); }
                            );
                          });
                        }}
                        onDelete={() => {
                          showConfirm({
                            title: "Xóa trận đấu",
                            message: `Bạn có chắc muốn xóa trận ${match.home.name} vs ${match.away.name}?`,
                            danger: true,
                            onConfirm: () => {
                              import('./api/adminApi').then(mod => {
                                handleApiAction(
                                  mod.default.deleteMatch(match.id),
                                  () => { onDeleteMatch?.(day.id, match.id); }
                                );
                              });
                            }
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
        ) : section === "teams" ? (
          <>
            <div className="admin-card admin-card--wide">
              <div className="admin-card__head">
                <h4>Thêm đội mới</h4>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <label className="field" style={{ flex: 1, minWidth: 150 }}>
                  <span>Tên đội</span>
                  <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Nhập tên đội..." />
                </label>
                <label className="field" style={{ flex: 1, minWidth: 150 }}>
                  <span>Logo URL (tùy chọn)</span>
                  <input type="text" value={newTeamLogo} onChange={(e) => setNewTeamLogo(e.target.value)} placeholder="https://..." />
                </label>
                <button className="primary-btn" type="button" onClick={handleCreateTeam} style={{ marginBottom: 4 }}>Thêm đội</button>
              </div>
            </div>

            <div className="admin-card admin-card--wide">
              <div className="admin-card__head">
                <h4>Danh sách đội ({teams.length})</h4>
                <button className="primary-btn ghost-btn" type="button" onClick={onRefreshTeams}>Tải lại</button>
              </div>
              {teams.length > 0 ? (
                <div className="admin-user-grid" style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isNarrow ? 12 : 16 }}>
                  {teams.map((team) => (
                    <div key={team.id} className="admin-user-tile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#5bed9f" }}>
                          {team.name?.[0] || "?"}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        {editingTeam?.id === team.id ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <input type="text" value={editingTeam.name} onChange={(e) => setEditingTeam(prev => ({ ...prev, name: e.target.value }))} style={{ flex: 1, minWidth: 100 }} />
                            <input type="text" value={editingTeam.logo} onChange={(e) => setEditingTeam(prev => ({ ...prev, logo: e.target.value }))} placeholder="Logo URL" style={{ flex: 1, minWidth: 100 }} />
                            <button className="primary-btn" type="button" onClick={() => handleUpdateTeam(team.id, { name: editingTeam.name, logo: editingTeam.logo })}>Lưu</button>
                            <button className="secondary-btn" type="button" onClick={() => setEditingTeam(null)}>Hủy</button>
                          </div>
                        ) : (
                          <div className="admin-user-name">{team.name}</div>
                        )}
                      </div>
                      {editingTeam?.id !== team.id && (
                        <div className="admin-user-actions" style={{ display: "flex", gap: 6 }}>
                          <button className="primary-btn ghost-btn" type="button" onClick={() => setEditingTeam({ id: team.id, name: team.name, logo: team.logo || "" })}>Sửa</button>
                          <button className="primary-btn" type="button" onClick={() => handleDeleteTeam(team)}>Xóa</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="muted">Chưa có đội nào. Thêm đội mới ở trên.</p>}
            </div>
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
                              showConfirm({
                                title: active ? "Khóa tài khoản" : "Mở khóa tài khoản",
                                message: `Bạn có chắc muốn ${active ? "khóa" : "mở khóa"} user ${u.full_name}?`,
                                danger: active,
                                onConfirm: () => {
                                  userAdminApi.lock(u.id, !active).then(onRefreshUsers).catch(err => showToast?.(err.response?.data?.detail || err.message, "error"));
                                }
                              });
                            }}
                          >
                            {active ? "Khóa" : "Mở khóa"}
                          </button>
                          <button
                            className="primary-btn"
                            type="button"
                            onClick={() => {
                              showConfirm({
                                title: "Xóa tài khoản",
                                message: `Bạn có chắc muốn xóa user ${u.full_name}? Hành động này không thể hoàn tác.`,
                                danger: true,
                                onConfirm: () => {
                                  userAdminApi.delete(u.id).then(onRefreshUsers).catch(err => showToast?.(err.response?.data?.detail || err.message, "error"));
                                }
                              });
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
function AdminMatchCard({ match, teams, onUpdate, onDelete, onRefresh, onToast }) {
  const isNarrow = useIsNarrow(768);
  const [isEditing, setIsEditing] = React.useState(false);
  const [eventForm, setEventForm] = React.useState({ team_side: "a", player: "", minute: "", jersey_number: "" });
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
      onToast?.("Nhập tên cầu thủ và phút ghi bàn", "warning");
      return;
    }
    try {
      await matchApi.addEvent(match.id, {
        player: eventForm.player,
        minute: eventForm.minute,
        jersey_number: eventForm.jersey_number,
        type: "goal",
        team_side: eventForm.team_side,
      });
      setEventForm({ team_side: "a", player: "", minute: "", jersey_number: "" });
      onRefresh?.();
    } catch (err) {
      onToast?.(err.response?.data?.detail || err.message, "error");
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
          teams={teams}
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
                    <span style={{ wordBreak: "break-word", justifySelf: "end" }}>
                      {ev.player || "?"} {ev.jersey_number ? `(#${ev.jersey_number})` : ""}
                    </span>
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
                    <span style={{ wordBreak: "break-word" }}>
                      {ev.player || "?"} {ev.jersey_number ? `(#${ev.jersey_number})` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">-</p>}
          </div>
        </div>

        <form className="admin-event-form" onSubmit={handleAddEvent}>
          <div className="admin-form-row">
            <label className="field">
              <span>Đội</span>
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
              <span>Số áo</span>
              <input
                type="text"
                value={eventForm.jersey_number}
                onChange={(e) => setEventForm((p) => ({ ...p, jersey_number: e.target.value }))}
                placeholder="10"
                style={{ width: "60px" }}
              />
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

function AdminMatchForm({ initialMatch, submitLabel = "Luu", teams = [], onSubmit }) {
  const emptyForm = {
    competition: "", status: "upcoming", date: "", kickoff: "", minute: "",
    homeName: "", homeLogo: "", homeScore: "", awayName: "", awayLogo: "", awayScore: "",
  };
  const isNarrow = useIsNarrow(768);

  // Trong component AdminMatchForm
  const toFormState = (match) => ({
    competition: match?.competition || "",
    status: match?.status || "upcoming",

    // Lấy thẳng chuỗi từ match, ưu tiên rawKickoff (dạng HH:mm)
    date: match?.date || "",
    kickoff: match?.rawKickoff || match?.kickoff || "",


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

  // Khi chọn đội từ dropdown, tự động fill logo nếu có
  const handleTeamSelect = (side, teamName) => {
    const team = teams.find(t => t.name === teamName);
    if (side === "home") {
      setForm(prev => ({
        ...prev,
        homeName: teamName,
        homeLogo: team?.logo || prev.homeLogo || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        awayName: teamName,
        awayLogo: team?.logo || prev.awayLogo || ""
      }));
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
        <label className="field">
          <span>Giải đấu</span>
          <select className="field-select" {...bind("competition")}>
            <option value="">-- Chọn trận đấu --</option>
            {COMPETITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>
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
          <label className="field">
            <span>Tên</span>
            <select className="field-select" value={form.homeName} onChange={(e) => handleTeamSelect("home", e.target.value)}>
              <option value="">-- Chọn đội --</option>
              {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
          </label>
          {/* Logo automatically handled */}
          <label className="field"><span>Tỷ số</span><input type="number" {...bind("homeScore")} /></label>
        </div>
        <div className="admin-team-col">
          <p className="eyebrow">Đội khách</p>
          <label className="field">
            <span>Tên</span>
            <select className="field-select" value={form.awayName} onChange={(e) => handleTeamSelect("away", e.target.value)}>
              <option value="">-- Chọn đội --</option>
              {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
          </label>
          {/* Logo automatically handled */}
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
      <div className="champion-text"><span className="eyebrow">Vô địch</span><strong>Max FC</strong></div>
    </div>
  );
}

function SecondPlaceCard({ extraClass }) {
  return (
    <div className={`prize-card ${extraClass || ""}`}>
      <div className="prize-text"><span className="eyebrow">Giải nhì</span><strong>Galocticos</strong></div>
    </div>
  );
}

function ThirdPlaceCard({ extraClass }) {
  return (
    <div className={`prize-card ${extraClass || ""}`}>
      <div className="prize-text"><span className="eyebrow">Giải ba</span><strong>Melbourne FPI</strong></div>
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
    ? "M0 100 C 35 100 70 100 100 110 C 110 120 120 135 140 200 M0 300 C 32 300 52 270 70 200 C 88 130 108 100 140 100"
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

function MatchCard({ match, onSelect, onPredict, user, onOpenAuth, myPredictions }) {
  // Translate labels
  const statusLabel = match.status === "live" ? `TRỰC TIẾP ${match.minute || ""}` : match.status === "ft" ? "Kết thúc" : match.kickoff;

  // Trạng thái tiếng Việt có dấu
  const statusText = match.status === "live" ? "Đang diễn ra"
    : match.status === "ft" ? "Kết thúc"
      : "Sắp diễn ra";

  const canPredict = match.status === "upcoming" && !match.is_locked;

  // Check if teams are valid (not empty/null and not placeholder names)
  const isValidTeamName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const n = name.trim().toLowerCase();
    return n && n !== 'tbd' && n !== '?' && n !== 'chưa xác định' && n !== 'n/a' && n.length > 0;
  };
  const hasTeams = isValidTeamName(match.home?.name) && isValidTeamName(match.away?.name);

  const handlePredictClick = (e) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth?.();
      return;
    }
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

      {/* Chỉ hiện nút dự đoán nếu đã xác định đội đấu */}
      {hasTeams && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 12, flexWrap: "wrap" }}>
          <span className="muted" style={{ fontSize: 13 }}>
            {user ? "Ấn để xem chi tiết & dự đoán" : "Đăng nhập để tham gia dự đoán"}
          </span>
          {myPredictions && myPredictions[match.id] ? (
            <div style={{
              padding: "6px 14px",
              background: "rgba(91, 237, 159, 0.15)",
              border: "1px solid rgba(91, 237, 159, 0.4)",
              borderRadius: 6,
              color: "#5bed9f",
              fontSize: 13,
              fontWeight: 700
            }}>
              Bạn dự đoán: {myPredictions[match.id].score_a} - {myPredictions[match.id].score_b}
            </div>
          ) : (
            <button
              className="primary-btn"
              type="button"
              // Nếu chưa login thì luôn enable để bấm vào hiện login form
              disabled={user ? !canPredict : false}
              onClick={handlePredictClick}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 0.2,
                boxShadow: "0 0 0 2px rgba(91, 237, 159, 0.25), 0 10px 30px rgba(91, 237, 159, 0.35)",
                background: (user && !canPredict) ? "rgba(255,255,255,0.12)" : "linear-gradient(120deg, #5bed9f, #38d27f)",
                color: (user && !canPredict) ? "#ccc" : "#0a2c1d",
                border: "none",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                transform: (user && !canPredict) ? "none" : "translateY(-1px)",
              }}
            >
              {!user ? "Đăng nhập / Đăng ký" : (canPredict ? "Dự đoán" : "Đã khóa")}
            </button>
          )}
        </div>
      )}
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

function MatchDetailModal({ match, user, initialTab = "info", onClose, showToast, onRequestLogin }) {
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
    if (!homePick || !awayPick) {
      showToast?.("Vui lòng nhập tỷ số", "warning");
      return;
    }
    try {
      await matchApi.predict({ match_id: match.id, score_a: parseInt(homePick), score_b: parseInt(awayPick) });
      showToast?.("Dự đoán thành công!", "success");
      const data = await matchApi.getMatchDetail(match.id);
      setDetail(data);
    } catch (error) {
      const msg = error.response?.data?.detail || "Lỗi dự đoán";
      showToast?.(msg, "error");
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
  const maskName = (name) => name || "An danh";
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

  // Check if teams are valid for prediction
  const isValidTeamName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const n = name.trim().toLowerCase();
    return n && n !== 'tbd' && n !== '?' && n !== 'chưa xác định' && n !== 'n/a' && n.length > 0;
  };
  const hasTeams = isValidTeamName(displayMatch.team_a) && isValidTeamName(displayMatch.team_b);
  const canPredict = isUpcoming && hasTeams;
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
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(91, 237, 159, 0.1) 0%, rgba(91, 237, 159, 0.05) 100%)",
                    borderRadius: 16,
                    border: "1px solid rgba(91, 237, 159, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  <div className="eyebrow" style={{ color: "#5bed9f", fontSize: "11px", letterSpacing: "1px" }}>DỰ ĐOÁN CỦA BẠN</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "32px", fontWeight: "800", textShadow: "0 2px 10px rgba(91, 237, 159, 0.3)" }}>
                    <span style={{ color: "#fff" }}>{myPrediction.pick.split('-')[0]}</span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "20px" }}>-</span>
                    <span style={{ color: "#fff" }}>{myPrediction.pick.split('-')[1]}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", width: "100%", alignItems: "center", textAlign: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{displayMatch.team_a}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>vs</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{displayMatch.team_b}</span>
                  </div>
                </div>
              )}
              {!hasPredicted && (
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
                      onClick={() => {
                        if (!user) {
                          onClose?.(); // Đóng modal hiện tại
                          onRequestLogin?.();
                        } else {
                          handlePredict();
                        }
                      }}
                      disabled={(!user ? false : !canPredict || hasPredicted)} // Chưa đăng nhập thì luôn active để click
                    >
                      {!user ? "Đăng nhập / Đăng ký" : !hasTeams ? "Chưa xác định đội" : (canPredict ? (hasPredicted ? "Bạn đã dự đoán" : "Gửi dự đoán") : "Đã khóa")}
                    </button>
                    {!user && <div className="muted" style={{ fontSize: 12 }}>Vui lòng đăng nhập để tham gia dự đoán</div>}
                    {user && !hasTeams && <div className="muted" style={{ fontSize: 12 }}>Dự đoán sẽ mở khi đã xác định 2 đội đấu</div>}
                    {user && hasTeams && !isUpcoming && <div className="muted" style={{ fontSize: 12 }}>Dự đoán chỉ mở khi trận chưa bắt đầu</div>}
                  </div>
                </div>
              )}
              <div className="predict-summary">
                <p className="eyebrow">Tổng lượt: {stats.total || 0}</p>
                {stats.total > 0 ? (
                  <div className="predict-bar predict-bar--stack">
                    <div className="predict-segment predict-segment--home" style={{ width: `${stats.home_percent}%` }}>{stats.home_percent}%</div>
                    <div className="predict-segment predict-segment--draw" style={{ width: `${stats.draw_percent}%` }}>{stats.draw_percent}%</div>
                    <div className="predict-segment predict-segment--away" style={{ width: `${stats.away_percent}%` }}>{stats.away_percent}%</div>
                  </div>
                ) : (
                  <p className="muted">Chưa có ai dự đoán</p>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}





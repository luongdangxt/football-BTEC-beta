import React from 'react';

const quarterGames = [
  { id: 'g1', label: 'Game 1', slots: ['Team 1', 'Team 2'] },
  { id: 'g2', label: 'Game 2', slots: ['Team 3', 'Team 4'] },
  { id: 'g3', label: 'Game 3', slots: ['Team 5', 'Team 6'] },
  { id: 'g4', label: 'Game 4', slots: ['Team 7', 'Team 8'] },
];

const semiGames = [
  { id: 'g5', label: 'Game 5', slots: ['Game 1 winner', 'Game 2 winner'], connectorHeight: 94 },
  { id: 'g6', label: 'Game 6', slots: ['Game 3 winner', 'Game 4 winner'], connectorHeight: 94 },
];

const finalGame = { id: 'g7', label: 'Game 7', slots: ['Game 5 winner', 'Game 6 winner'], connectorHeight: 188 };

export default function App() {
  const [showAuth, setShowAuth] = React.useState(false);

  return (
    <div className="app">
      <div className="backdrop" />
      <main className="shell">
        <header className="hero">
          <div className="hero-text">
            <p className="eyebrow">Football tournament</p>
            <h1>Cay bracket du doan</h1>
            <p className="lede">Bo cuc ngang, 4 tran dau vao, 2 tran ban ket, 1 tran chung ket kem cup va duong noi giong hinh mau.</p>
          </div>
          <div className="badge">
            <div className="badge-ball" />
            <div className="badge-text">
              <span className="badge-title">FOOTBALL</span>
              <span className="badge-sub">TOURNAMENT</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary-btn ghost-btn" type="button" onClick={() => setShowAuth(true)}>
              Đăng nhập
            </button>
          </div>
        </header>

        <section className="board">
          <div className="board-viewport">
            <div className="round-anchor round-anchor--qf" aria-hidden />
            <div className="round-anchor round-anchor--semi" aria-hidden />
            <div className="round-anchor round-anchor--final" aria-hidden />
            <div className="round-anchor round-anchor--champ" aria-hidden />

            <div className="board-grid">
              <GameCard game={quarterGames[0]} variant="quarter" extraClass="pos-q1" />
              <GameCard game={quarterGames[1]} variant="quarter" extraClass="pos-q2" />
              <GameCard game={quarterGames[2]} variant="quarter" extraClass="pos-q3" />
              <GameCard game={quarterGames[3]} variant="quarter" extraClass="pos-q4" />

              <GameCard game={semiGames[0]} variant="semi" extraClass="pos-s1" />
              <GameCard game={semiGames[1]} variant="semi" extraClass="pos-s2" />

              <GameCard game={finalGame} variant="final" extraClass="pos-f" />
              <ChampionCard extraClass="pos-champion" />

              <Connector className="connector connector-q12" mode="q" />
              <Connector className="connector connector-q34" mode="q" />
              <Connector className="connector connector-semis" mode="semi" />
              <Connector className="connector connector-final" mode="final" />

              <div className="round-label round-label--qf">Round 1</div>
              <div className="round-label round-label--semi">Round 2</div>
              <div className="round-label round-label--final">Final</div>
              <div className="round-label round-label--champ">Champion</div>
            </div>
          </div>
        </section>
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </main>
    </div>
  );
}

function AuthModal({ open, onClose }) {
  const [view, setView] = React.useState('login');

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (open) {
      window.addEventListener('keydown', handler);
    }
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) {
      setView('login');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <div className="auth-modal__head">
          <div>
            <p className="eyebrow">Football tournament</p>
            <h2>{view === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <section className="auth auth--single">
          {view === 'login' ? (
            <div className="auth-card">
              <div className="auth-card__head">
                <p className="eyebrow">Truy cap</p>
                <h3>Đăng nhập</h3>
                <p className="muted">Vào nhanh để lưu bracket, đồng bộ dự đoán trên mọi thiết bị.</p>
              </div>
              <AuthForm mode="login" />
              <div className="auth-foot">
                <span>
                  Không có tài khoản?{' '}
                  <button type="button" className="link-button" onClick={() => setView('register')}>
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
                <p className="muted">Theo dõi tiến độ giải, nhận cập nhật và chia sẻ đường dẫn dự đoán.</p>
              </div>
              <AuthForm mode="register" />
              <div className="auth-foot">
                <span>
                  Đã có tài khoản?{' '}
                  <button type="button" className="link-button" onClick={() => setView('login')}>
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

function AuthForm({ mode }) {
  const isLogin = mode === 'login';

  return (
    <form className="auth-form">
      <label className="field">
        <span>MSV</span>
        <input
          type="text"
          name="studentId"
          className="uppercase-input"
          placeholder="VD: BH01234"
          autoComplete="username"
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
          }}
        />
      </label>

      {!isLogin && (
        <>
          <label className="field">
            <span>Họ và tên</span>
            <input type="text" name="fullName" placeholder="Nguyễn Văn A" autoComplete="name" />
          </label>

          <label className="field">
            <span>Số điện thoại</span>
            <input type="tel" name="phone" placeholder="09xx xxx xxx" autoComplete="tel" />
          </label>
        </>
      )}

      <label className="field">
        <span>{isLogin ? 'Mật khẩu' : 'Tạo mật khẩu'}</span>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
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
            <span>Ghi nhớ tôi</span>
          </label>
          <button type="button" className="link-button">
            Quên mật khẩu?
          </button>
        </div>
      )}

      <button className="primary-btn" type="submit">
        {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
      </button>
    </form>
  );
}

function GameCard({ game, variant, extraClass }) {
  return (
    <div className={`game-card game-card--${variant} ${extraClass || ''}`}>
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
    <div className={`champion-card ${extraClass || ''}`}>
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
  const isSemi = mode === 'semi';
  const isFinal = mode === 'final';
  const viewBox = isSemi ? '0 0 140 400' : isFinal ? '0 0 120 220' : '0 0 140 200';
  let path;

  if (isSemi) {
    path = 'M0 100 C 40 100 40 150 80 200 C 40 250 40 300 0 300 M80 200 C 110 200 125 200 140 200';
  } else if (isFinal) {
    path = 'M0 110 C 30 110 60 110 120 110';
  } else {
    path = 'M0 50 C 35 50 35 70 70 100 C 35 130 35 150 0 150 M70 100 C 100 100 125 100 140 100';
  }

  return (
    <div className={className}>
      <svg viewBox={viewBox} preserveAspectRatio="none" className="connector-svg">
        <path className="connector-path" d={path} />
      </svg>
    </div>
  );
}

import { useState, useEffect } from 'react'
import './bumblebee-landing.css'

// B2Bee API for authentication
const B2BEE_API = 'https://b2bee.tech'

function BumbleBeeLanding() {
  // Auth state
  const [user, setUser] = useState(null)
  const [apiKey, setApiKey] = useState(null)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bumblebee_user')
    const savedApiKey = localStorage.getItem('bumblebee_api_key')
    if (savedUser && savedApiKey) {
      setUser(JSON.parse(savedUser))
      setApiKey(savedApiKey)
    }
  }, [])

  async function handleAuth(e) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const endpoint = authMode === 'signup'
        ? `${B2BEE_API}/api/public/auth/signup`
        : `${B2BEE_API}/api/public/auth/login`

      const body = authMode === 'signup'
        ? { email: email.trim(), password, name: name.trim() }
        : { email: email.trim(), password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro na autenticacao')
      }

      // Save user and API key
      localStorage.setItem('bumblebee_user', JSON.stringify(data.user))
      localStorage.setItem('bumblebee_api_key', data.apiKey)
      setUser(data.user)
      setApiKey(data.apiKey)

      // Clear form
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setAuthError(err.message || 'Erro na autenticacao. Tente novamente.')
    }

    setAuthLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('bumblebee_user')
    localStorage.removeItem('bumblebee_api_key')
    setUser(null)
    setApiKey(null)
  }

  function copyApiKey() {
    navigator.clipboard.writeText(apiKey)
    // Could add a toast notification here
  }

  return (
    <div className="landing">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="logo-section">
            <div className="bee-icon">B</div>
            <h1>BumbleBee</h1>
            <p className="tagline">Seu assistente de voz AI para Mac e Windows</p>
          </div>

          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">🎤</span>
              <span>Controle por voz</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🖥️</span>
              <span>Controle do desktop</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Produtividade</span>
            </div>
          </div>
        </div>
      </header>

      {/* Download Section - Always visible */}
      <section className="download-section">
        <div className="download-card">
          <h2>Baixe o BumbleBee Gratis</h2>
          <p className="download-subtitle">Disponivel para Windows e macOS</p>

          <div className="download-buttons">
            <a
              href="https://pub-bumblebee.b2bee.tech/latest/BumbleBee-Windows.exe"
              className="download-btn windows"
            >
              <span className="btn-icon">⊞</span>
              <span className="btn-text">
                <strong>Windows</strong>
                <small>Windows 10/11</small>
              </span>
            </a>

            <a
              href="https://pub-bumblebee.b2bee.tech/latest/BumbleBee-macOS.dmg"
              className="download-btn mac"
            >
              <span className="btn-icon">🍎</span>
              <span className="btn-text">
                <strong>macOS</strong>
                <small>macOS 12+</small>
              </span>
            </a>
          </div>

          {/* Platform-specific install tips */}
          <div className="install-instructions">
            <h3>Dicas de Instalacao:</h3>
            <div className="instructions-tabs">
              <details>
                <summary>Windows</summary>
                <ol>
                  <li>Se aparecer aviso do Windows, clique "Mais informacoes" e "Executar assim mesmo"</li>
                  <li>Procure o icone da abelha na bandeja do sistema (canto inferior direito)</li>
                </ol>
              </details>
              <details>
                <summary>macOS</summary>
                <ol>
                  <li>Abra o DMG e arraste para Applications</li>
                  <li>Na primeira vez: clique direito no app e "Abrir"</li>
                  <li>Conceda permissoes de Gravacao de Tela e Acessibilidade</li>
                </ol>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* API Key Section - Auth required */}
      <section className="api-key-section">
        {!user ? (
          <div className="auth-card">
            <h2>Ative o BumbleBee</h2>
            <p className="auth-subtitle">Crie sua conta gratuita para obter sua API Key</p>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                Entrar
              </button>
              <button
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={authLoading}
                />
              )}
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authLoading}
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={authLoading}
              />

              {authError && <p className="auth-error">{authError}</p>}

              <button type="submit" disabled={authLoading} className="auth-submit">
                {authLoading
                  ? 'Carregando...'
                  : authMode === 'signup' ? 'Criar Conta' : 'Entrar'
                }
              </button>
            </form>
          </div>
        ) : (
          <div className="api-key-card">
            <div className="user-welcome">
              <span>Ola, {user.name || user.email}!</span>
              <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>

            <h2>Sua API Key</h2>
            <p className="api-key-subtitle">Cole esta chave nas configuracoes do BumbleBee</p>

            <div className="api-key-display">
              <code>{apiKey}</code>
              <button onClick={copyApiKey} className="copy-btn" title="Copiar">
                📋
              </button>
            </div>

            <div className="setup-reminder">
              <strong>Como usar:</strong>
              <ol>
                <li>Abra o BumbleBee no seu computador</li>
                <li>Clique no icone da abelha</li>
                <li>Va em "Configuracoes"</li>
                <li>Cole sua API Key</li>
              </ol>
            </div>
          </div>
        )}
      </section>

      {/* Beta Evaluation Program */}
      <section className="beta-section">
        <div className="beta-card">
          <div className="beta-badge">BETA</div>
          <h2>Programa de Avaliacao Beta</h2>
          <p className="beta-subtitle">Ajude a melhorar o BumbleBee e ganhe recompensas!</p>

          <div className="rewards-grid">
            <div className="reward-item">
              <span className="reward-icon">🐝</span>
              <span className="reward-text">
                <strong>+15 Honey</strong>
                <small>por bug reportado</small>
              </span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💡</span>
              <span className="reward-text">
                <strong>+10 Honey</strong>
                <small>por sugestao</small>
              </span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span className="reward-text">
                <strong>+50 Honey</strong>
                <small>por feedback de alto impacto</small>
              </span>
            </div>
          </div>

          <a
            href="https://appfeedback-one.vercel.app/?variant=bumblebee"
            className="beta-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Participar do Programa Beta
          </a>

          <p className="beta-note">
            Seus creditos Honey podem ser trocados por recursos premium!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>O que o BumbleBee faz</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">🎤</div>
            <h3>Assistente de Voz</h3>
            <p>Diga "Hey BumbleBee" e faca perguntas, abra apps, ou controle seu computador.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">🖱️</div>
            <h3>Controle do Desktop</h3>
            <p>Clique em botoes, preencha formularios, e navegue usando comandos de voz.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📅</div>
            <h3>Reunioes</h3>
            <p>Transcricao automatica e resumos de reunioes com itens de acao.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📈</div>
            <h3>Produtividade</h3>
            <p>Acompanhe metas, veja seu resumo do dia, e mantenha o foco.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">⏰</div>
            <h3>Lembretes</h3>
            <p>Crie lembretes e timers usando apenas sua voz.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">🌐</div>
            <h3>Pesquisa Web</h3>
            <p>Pergunte qualquer coisa - preco do Bitcoin, clima, noticias.</p>
          </div>
        </div>
      </section>

      {/* Commands Section */}
      <section className="commands-section">
        <h2>Comandos de Exemplo</h2>

        <div className="commands-list">
          <div className="command">"Hey BumbleBee, qual o preco do Bitcoin?"</div>
          <div className="command">"Abrir Chrome"</div>
          <div className="command">"O que eu fiz hoje?"</div>
          <div className="command">"Como estao minhas metas?"</div>
          <div className="command">"Clique no botao enviar"</div>
          <div className="command">"Set timer 5 minutos"</div>
          <div className="command">"Lembre-me de ligar para o cliente as 3pm"</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="bee-icon-small">B</span>
            <span>BumbleBee</span>
          </div>
          <div className="footer-links">
            <a href="https://appfeedback-one.vercel.app/?variant=bumblebee">Feedback</a>
            <a href="mailto:support@bumblebee.app">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BumbleBeeLanding

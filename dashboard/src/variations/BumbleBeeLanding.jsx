import { useState, useEffect, useCallback } from 'react'
import './bumblebee-landing.css'

// B2Bee API for authentication
const B2BEE_API = 'https://b2bee.tech'

// Translations
const translations = {
  en: {
    tagline: 'Your AI voice assistant for Mac and Windows',
    heroFeatures: ['Voice Control', 'Desktop Control', 'Productivity'],
    downloadTitle: 'Download BumbleBee Free',
    downloadSubtitle: 'Available for Windows and macOS',
    installTips: 'Installation Tips:',
    windowsInstructions: [
      'If Windows shows a warning, click "More info" and "Run anyway"',
      'Look for the bee icon in the system tray (bottom right corner)'
    ],
    macInstructions: [
      'Open the DMG and drag to Applications',
      'First time: right-click the app and select "Open"',
      'Grant Screen Recording and Accessibility permissions'
    ],
    activateTitle: 'Activate BumbleBee',
    activateSubtitle: 'Create your free account to get your API Key',
    login: 'Log In',
    signup: 'Sign Up',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'Password',
    loading: 'Loading...',
    createAccount: 'Create Account',
    hello: 'Hello',
    logout: 'Log Out',
    yourApiKey: 'Your API Key',
    apiKeySubtitle: 'Paste this key in BumbleBee settings',
    howToUse: 'How to use:',
    howToUseSteps: [
      'Open BumbleBee on your computer',
      'Click the bee icon',
      'Go to "Settings"',
      'Paste your API Key'
    ],
    betaTitle: 'Beta Evaluation Program',
    betaSubtitle: 'Help improve BumbleBee and earn rewards!',
    perBugReported: 'per bug reported',
    perSuggestion: 'per suggestion',
    perHighImpact: 'per high impact feedback',
    joinBeta: 'Join Beta Program',
    betaNote: 'BumbleBee is open source! Your Honey credits can be exchanged for free usage credits.',
    featuresTitle: 'What BumbleBee Does',
    features: {
      voice: { title: 'Voice Assistant', desc: 'Say "Hey BumbleBee" and ask questions, open apps, or control your computer.' },
      desktop: { title: 'Desktop Control', desc: 'Click buttons, fill forms, and navigate using voice commands.' },
      meetings: { title: 'Meetings', desc: 'Automatic transcription and meeting summaries with action items.' },
      productivity: { title: 'Productivity', desc: 'Track goals, see your day summary, and stay focused.' },
      reminders: { title: 'Reminders', desc: 'Create reminders and timers using just your voice.' },
      web: { title: 'Web Search', desc: 'Ask anything - Bitcoin price, weather, news.' },
      communications: { title: 'Communications', desc: 'Smart capture when using WhatsApp, Slack, Teams, Discord, and more.' },
      social: { title: 'Social Media', desc: 'Track time on LinkedIn, Twitter, Instagram and get productivity insights.' }
    },
    commandsTitle: 'Example Commands',
    commands: [
      '"Hey BumbleBee, what\'s the weather in New York?"',
      '"Schedule a meeting with John tomorrow at 3pm"',
      '"Summarize my last Zoom call"',
      '"What did I work on this week?"',
      '"Send a message to Sarah on WhatsApp"',
      '"Open Spotify and play some jazz"',
      '"Set a reminder to call mom in 2 hours"',
      '"How much time did I spend on social media today?"'
    ],
    footerFeedback: 'Feedback',
    footerSupport: 'Support',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    companyInfo: 'B2Bee Technologies Inc.',
    companyAddress: 'San Francisco, CA'
  },
  pt: {
    tagline: 'Seu assistente de voz AI para Mac e Windows',
    heroFeatures: ['Controle por Voz', 'Controle do Desktop', 'Produtividade'],
    downloadTitle: 'Baixe o BumbleBee Gratis',
    downloadSubtitle: 'Disponivel para Windows e macOS',
    installTips: 'Dicas de Instalacao:',
    windowsInstructions: [
      'Se aparecer aviso do Windows, clique "Mais informacoes" e "Executar assim mesmo"',
      'Procure o icone da abelha na bandeja do sistema (canto inferior direito)'
    ],
    macInstructions: [
      'Abra o DMG e arraste para Applications',
      'Na primeira vez: clique direito no app e "Abrir"',
      'Conceda permissoes de Gravacao de Tela e Acessibilidade'
    ],
    activateTitle: 'Ative o BumbleBee',
    activateSubtitle: 'Crie sua conta gratuita para obter sua API Key',
    login: 'Entrar',
    signup: 'Criar Conta',
    namePlaceholder: 'Seu nome',
    emailPlaceholder: 'seu@email.com',
    passwordPlaceholder: 'Senha',
    loading: 'Carregando...',
    createAccount: 'Criar Conta',
    hello: 'Ola',
    logout: 'Sair',
    yourApiKey: 'Sua API Key',
    apiKeySubtitle: 'Cole esta chave nas configuracoes do BumbleBee',
    howToUse: 'Como usar:',
    howToUseSteps: [
      'Abra o BumbleBee no seu computador',
      'Clique no icone da abelha',
      'Va em "Configuracoes"',
      'Cole sua API Key'
    ],
    betaTitle: 'Programa de Avaliacao Beta',
    betaSubtitle: 'Ajude a melhorar o BumbleBee e ganhe recompensas!',
    perBugReported: 'por bug reportado',
    perSuggestion: 'por sugestao',
    perHighImpact: 'por feedback de alto impacto',
    joinBeta: 'Participar do Programa Beta',
    betaNote: 'BumbleBee e open source! Seus creditos Honey podem ser trocados por creditos de uso gratuito.',
    featuresTitle: 'O que o BumbleBee Faz',
    features: {
      voice: { title: 'Assistente de Voz', desc: 'Diga "Hey BumbleBee" e faca perguntas, abra apps, ou controle seu computador.' },
      desktop: { title: 'Controle do Desktop', desc: 'Clique em botoes, preencha formularios, e navegue usando comandos de voz.' },
      meetings: { title: 'Reunioes', desc: 'Transcricao automatica e resumos de reunioes com itens de acao.' },
      productivity: { title: 'Produtividade', desc: 'Acompanhe metas, veja seu resumo do dia, e mantenha o foco.' },
      reminders: { title: 'Lembretes', desc: 'Crie lembretes e timers usando apenas sua voz.' },
      web: { title: 'Pesquisa Web', desc: 'Pergunte qualquer coisa - preco do Bitcoin, clima, noticias.' },
      communications: { title: 'Comunicacoes', desc: 'Captura inteligente ao usar WhatsApp, Slack, Teams, Discord e mais.' },
      social: { title: 'Redes Sociais', desc: 'Acompanhe tempo no LinkedIn, Twitter, Instagram e obtenha insights de produtividade.' }
    },
    commandsTitle: 'Comandos de Exemplo',
    commands: [
      '"Hey BumbleBee, como esta o tempo em Sao Paulo?"',
      '"Agende uma reuniao com Joao amanha as 15h"',
      '"Resuma minha ultima chamada do Zoom"',
      '"O que eu trabalhei essa semana?"',
      '"Mande uma mensagem para Maria no WhatsApp"',
      '"Abra o Spotify e toque jazz"',
      '"Me lembre de ligar para mamae em 2 horas"',
      '"Quanto tempo passei nas redes sociais hoje?"'
    ],
    footerFeedback: 'Feedback',
    footerSupport: 'Suporte',
    footerPrivacy: 'Politica de Privacidade',
    footerTerms: 'Termos de Servico',
    companyInfo: 'B2Bee Technologies Inc.',
    companyAddress: 'San Francisco, CA'
  }
}

function BumbleBeeLanding() {
  // Language state
  const [lang, setLang] = useState('en')
  const t = translations[lang]

  // Command animation state
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Auth state
  const [user, setUser] = useState(null)
  const [apiKey, setApiKey] = useState(null)
  const [authMode, setAuthMode] = useState('login')
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

  // Command carousel animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentCommandIndex((prev) => (prev + 1) % t.commands.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [t.commands.length])

  const handleAuth = useCallback(async (e) => {
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
        throw new Error(data.error || 'Authentication error')
      }

      localStorage.setItem('bumblebee_user', JSON.stringify(data.user))
      localStorage.setItem('bumblebee_api_key', data.apiKey)
      setUser(data.user)
      setApiKey(data.apiKey)
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setAuthError(err.message || 'Authentication error. Please try again.')
    }

    setAuthLoading(false)
  }, [authMode, email, password, name])

  function handleLogout() {
    localStorage.removeItem('bumblebee_user')
    localStorage.removeItem('bumblebee_api_key')
    setUser(null)
    setApiKey(null)
  }

  function copyApiKey() {
    navigator.clipboard.writeText(apiKey)
  }

  return (
    <div className="landing">
      {/* Language Toggle */}
      <div className="language-toggle">
        <button
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          EN
        </button>
        <button
          className={`lang-btn ${lang === 'pt' ? 'active' : ''}`}
          onClick={() => setLang('pt')}
        >
          PT
        </button>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="logo-section">
            <div className="bee-icon">
              <svg viewBox="0 0 100 100" className="bee-svg">
                <ellipse cx="50" cy="55" rx="30" ry="35" fill="#FCD34D"/>
                <ellipse cx="50" cy="55" rx="30" ry="35" fill="url(#stripes)"/>
                <ellipse cx="50" cy="25" rx="18" ry="15" fill="#1C1917"/>
                <circle cx="42" cy="22" r="4" fill="white"/>
                <circle cx="58" cy="22" r="4" fill="white"/>
                <circle cx="42" cy="22" r="2" fill="#1C1917"/>
                <circle cx="58" cy="22" r="2" fill="#1C1917"/>
                <ellipse cx="25" cy="45" rx="18" ry="10" fill="rgba(255,255,255,0.4)" transform="rotate(-30 25 45)"/>
                <ellipse cx="75" cy="45" rx="18" ry="10" fill="rgba(255,255,255,0.4)" transform="rotate(30 75 45)"/>
                <path d="M44 12 Q50 0 56 12" stroke="#1C1917" strokeWidth="2" fill="none"/>
                <circle cx="44" cy="8" r="3" fill="#1C1917"/>
                <circle cx="56" cy="8" r="3" fill="#1C1917"/>
                <defs>
                  <pattern id="stripes" patternUnits="userSpaceOnUse" width="100" height="12">
                    <rect width="100" height="6" fill="#1C1917"/>
                    <rect y="6" width="100" height="6" fill="transparent"/>
                  </pattern>
                </defs>
              </svg>
            </div>
            <h1>BumbleBee</h1>
            <p className="tagline">{t.tagline}</p>
          </div>

          <div className="hero-features">
            {t.heroFeatures.map((feature, i) => (
              <div className="feature" key={i}>
                <span className="feature-icon">{['voice', 'desktop', 'chart'][i] === 'voice' ? '~' : ['desktop', 'chart'][i] === 'desktop' ? '*' : '#'}</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Download Section */}
      <section className="download-section">
        <div className="download-card">
          <h2>{t.downloadTitle}</h2>
          <p className="download-subtitle">{t.downloadSubtitle}</p>

          <div className="download-buttons">
            <a
              href="https://pub-5cec4c07c618467e97486ac887ce3606.r2.dev/latest/BumbleBee-Windows.exe"
              className="download-btn windows"
            >
              <span className="btn-icon">W</span>
              <span className="btn-text">
                <strong>Windows</strong>
                <small>Windows 10/11</small>
              </span>
            </a>

            <a
              href="https://pub-5cec4c07c618467e97486ac887ce3606.r2.dev/latest/BumbleBee-macOS.dmg"
              className="download-btn mac"
            >
              <span className="btn-icon">M</span>
              <span className="btn-text">
                <strong>macOS</strong>
                <small>macOS 12+</small>
              </span>
            </a>
          </div>

          <div className="install-instructions">
            <h3>{t.installTips}</h3>
            <div className="instructions-tabs">
              <details>
                <summary>Windows</summary>
                <ol>
                  {t.windowsInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
              <details>
                <summary>macOS</summary>
                <ol>
                  {t.macInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* API Key Section */}
      <section className="api-key-section">
        {!user ? (
          <div className="auth-card">
            <h2>{t.activateTitle}</h2>
            <p className="auth-subtitle">{t.activateSubtitle}</p>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                {t.login}
              </button>
              <button
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              >
                {t.signup}
              </button>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={authLoading}
                />
              )}
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authLoading}
              />
              <input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={authLoading}
              />

              {authError && <p className="auth-error">{authError}</p>}

              <button type="submit" disabled={authLoading} className="auth-submit">
                {authLoading
                  ? t.loading
                  : authMode === 'signup' ? t.createAccount : t.login
                }
              </button>
            </form>
          </div>
        ) : (
          <div className="api-key-card">
            <div className="user-welcome">
              <span>{t.hello}, {user.name || user.email}!</span>
              <button onClick={handleLogout} className="logout-btn">{t.logout}</button>
            </div>

            <h2>{t.yourApiKey}</h2>
            <p className="api-key-subtitle">{t.apiKeySubtitle}</p>

            <div className="api-key-display">
              <code>{apiKey}</code>
              <button onClick={copyApiKey} className="copy-btn" title="Copy">
                [copy]
              </button>
            </div>

            <div className="setup-reminder">
              <strong>{t.howToUse}</strong>
              <ol>
                {t.howToUseSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>

      {/* Beta Evaluation Program */}
      <section className="beta-section">
        <div className="beta-card">
          <div className="beta-badge">BETA</div>
          <h2>{t.betaTitle}</h2>
          <p className="beta-subtitle">{t.betaSubtitle}</p>

          <div className="rewards-grid">
            <div className="reward-item">
              <span className="reward-icon">B</span>
              <span className="reward-text">
                <strong>+15 Honey</strong>
                <small>{t.perBugReported}</small>
              </span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">!</span>
              <span className="reward-text">
                <strong>+10 Honey</strong>
                <small>{t.perSuggestion}</small>
              </span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">*</span>
              <span className="reward-text">
                <strong>+50 Honey</strong>
                <small>{t.perHighImpact}</small>
              </span>
            </div>
          </div>

          <a
            href="https://appfeedback-one.vercel.app/?variant=bumblebee"
            className="beta-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.joinBeta}
          </a>

          <p className="beta-note">
            {t.betaNote}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>{t.featuresTitle}</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">~</div>
            <h3>{t.features.voice.title}</h3>
            <p>{t.features.voice.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">*</div>
            <h3>{t.features.desktop.title}</h3>
            <p>{t.features.desktop.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">#</div>
            <h3>{t.features.meetings.title}</h3>
            <p>{t.features.meetings.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">^</div>
            <h3>{t.features.productivity.title}</h3>
            <p>{t.features.productivity.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">@</div>
            <h3>{t.features.reminders.title}</h3>
            <p>{t.features.reminders.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">$</div>
            <h3>{t.features.web.title}</h3>
            <p>{t.features.web.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">&amp;</div>
            <h3>{t.features.communications.title}</h3>
            <p>{t.features.communications.desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">%</div>
            <h3>{t.features.social.title}</h3>
            <p>{t.features.social.desc}</p>
          </div>
        </div>
      </section>

      {/* Commands Section with Spinning Wheel */}
      <section className="commands-section">
        <h2>{t.commandsTitle}</h2>

        <div className="commands-wheel">
          <div className="wheel-container">
            <div
              className="wheel-track"
              style={{ transform: `translateY(-${currentCommandIndex * 80}px)` }}
            >
              {t.commands.map((cmd, i) => (
                <div
                  key={i}
                  className={`wheel-card ${i === currentCommandIndex ? 'active' : ''}`}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
          <div className="wheel-fade-top"></div>
          <div className="wheel-fade-bottom"></div>
        </div>
      </section>

      {/* Follow on X CTA */}
      <section className="twitter-cta-section">
        <div className="twitter-cta">
          <div className="twitter-icon">X</div>
          <div className="twitter-text">
            <h3>{lang === 'en' ? 'Follow us on X' : 'Siga-nos no X'}</h3>
            <p>{lang === 'en' ? 'Get updates, tips, and behind-the-scenes' : 'Receba novidades, dicas e bastidores'}</p>
          </div>
          <a
            href="https://x.com/b2beetech"
            target="_blank"
            rel="noopener noreferrer"
            className="twitter-btn"
          >
            @b2beetech
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="bee-icon-small">
              <svg viewBox="0 0 100 100" className="bee-svg-small">
                <ellipse cx="50" cy="55" rx="30" ry="35" fill="#FCD34D"/>
                <ellipse cx="50" cy="25" rx="18" ry="15" fill="#1C1917"/>
                <circle cx="42" cy="22" r="3" fill="white"/>
                <circle cx="58" cy="22" r="3" fill="white"/>
              </svg>
            </div>
            <div className="footer-brand-text">
              <span className="brand-name">BumbleBee</span>
              <span className="brand-company">{t.companyInfo}</span>
            </div>
          </div>
          <div className="footer-links">
            <a href="https://appfeedback-one.vercel.app/?variant=bumblebee">{t.footerFeedback}</a>
            <a href="mailto:support@b2bee.tech">{t.footerSupport}</a>
            <a href="https://b2bee.tech/privacy">{t.footerPrivacy}</a>
            <a href="https://b2bee.tech/terms">{t.footerTerms}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.companyAddress}</p>
        </div>
      </footer>
    </div>
  )
}

export default BumbleBeeLanding

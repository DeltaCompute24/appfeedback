import { useState, useEffect } from 'react'
import './bumblebee-landing.css'

const API_BASE = '/api'

function BumbleBeeLanding() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check if already signed up (localStorage)
  useEffect(() => {
    const hasAccess = localStorage.getItem('bumblebee_download_access')
    if (hasAccess) {
      setSubmitted(true)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/signups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'bumblebee-landing',
          timestamp: new Date().toISOString()
        })
      })

      if (res.ok || res.status === 201) {
        localStorage.setItem('bumblebee_download_access', 'true')
        localStorage.setItem('bumblebee_user_email', email.trim())
        setSubmitted(true)
      } else {
        setError('Algo deu errado. Tente novamente.')
      }
    } catch (err) {
      // Even if API fails, grant access (fail open for better UX)
      localStorage.setItem('bumblebee_download_access', 'true')
      setSubmitted(true)
    }

    setSubmitting(false)
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

      {/* Download Section */}
      <section className="download-section">
        {!submitted ? (
          <div className="signup-card">
            <h2>Baixe o BumbleBee Gratis</h2>
            <p>Digite seu email para acessar o download</p>

            <form onSubmit={handleSubmit} className="signup-form">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
              <button type="submit" disabled={submitting || !email.trim()}>
                {submitting ? 'Enviando...' : 'Obter Download'}
              </button>
            </form>

            {error && <p className="error-msg">{error}</p>}

            <p className="privacy-note">
              Usaremos seu email apenas para avisar sobre atualizacoes importantes.
            </p>
          </div>
        ) : (
          <div className="download-card">
            <h2>Pronto! Escolha sua versao:</h2>

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

            {/* Setup Instructions */}
            <div className="setup-section">
              <h3>Como Configurar</h3>

              <div className="setup-steps">
                <div className="setup-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Instale o app</strong>
                    <p>Execute o instalador e siga as instrucoes</p>
                  </div>
                </div>

                <div className="setup-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Crie sua conta gratuita</strong>
                    <p>
                      <a href="https://b2bee.tech/signup" target="_blank" rel="noopener noreferrer" className="setup-link">
                        Criar conta no B2Bee
                      </a>
                    </p>
                  </div>
                </div>

                <div className="setup-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Pegue sua API Key</strong>
                    <p>
                      <a href="https://b2bee.tech/profile" target="_blank" rel="noopener noreferrer" className="setup-link">
                        Acessar Configuracoes do Perfil
                      </a>
                    </p>
                  </div>
                </div>

                <div className="setup-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <strong>Cole a API Key no app</strong>
                    <p>Clique no icone da abelha e va em "Configuracoes"</p>
                  </div>
                </div>
              </div>
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

      {/* Footer - Clean, no B2Bee branding */}
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

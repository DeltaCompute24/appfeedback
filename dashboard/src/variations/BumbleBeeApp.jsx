import { useState, useEffect } from 'react'
import './bumblebee.css'

const API_BASE = '/api'

const getUserId = () => {
  let userId = localStorage.getItem('bumblebee_feedback_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('bumblebee_feedback_user_id', userId)
  }
  return userId
}

const getInitialTheme = () => {
  const saved = localStorage.getItem('bumblebee_feedback_theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function BumbleBeeApp() {
  const [activeTab, setActiveTab] = useState('wishlist')
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [algorithm, setAlgorithm] = useState(null)
  const [userCredits, setUserCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('rank')
  const [theme, setTheme] = useState(getInitialTheme)

  const [formType, setFormType] = useState('wishlist')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formXHandle, setFormXHandle] = useState('')
  const [formPlatform, setFormPlatform] = useState('windows')
  const [formSteps, setFormSteps] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(null)

  const userId = getUserId()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bumblebee_feedback_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    fetchData()
  }, [activeTab, sortBy])

  useEffect(() => {
    fetchStats()
    fetchLeaderboard()
    fetchAlgorithm()
    fetchUserCredits()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/feedback?item_type=${activeTab}&sort_by=${sortBy}&user_id=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to fetch items:', err)
    }
    setLoading(false)
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  async function fetchLeaderboard() {
    try {
      const res = await fetch(`${API_BASE}/credits/leaderboard?limit=5`)
      if (res.ok) {
        setLeaderboard(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }
  }

  async function fetchAlgorithm() {
    try {
      const res = await fetch(`${API_BASE}/ranking/algorithm`)
      if (res.ok) {
        setAlgorithm(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch algorithm:', err)
    }
  }

  async function fetchUserCredits() {
    try {
      const res = await fetch(`${API_BASE}/credits/balance?user_id=${userId}`)
      if (res.ok) {
        setUserCredits(await res.json())
      }
    } catch (err) {
      // User might not have credits yet
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formTitle.trim() || !formDescription.trim()) return

    setSubmitting(true)
    setSubmitSuccess(null)

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: formType,
          title: formTitle.trim(),
          description: formDescription.trim(),
          user_id: userId,
          x_handle: formXHandle.trim() || null,
          platform: formPlatform,
          steps_to_reproduce: formType === 'bug' ? formSteps.trim() : ''
        })
      })
      if (res.ok) {
        const result = await res.json()
        setFormTitle('')
        setFormDescription('')
        setFormSteps('')
        fetchData()
        fetchStats()
        fetchUserCredits()

        // Show success message
        if (formType === 'bug' && result.github_issue_url) {
          setSubmitSuccess({
            type: 'bug',
            message: 'Bug reportado com sucesso!',
            issueUrl: result.github_issue_url
          })
        } else {
          setSubmitSuccess({
            type: formType,
            message: formType === 'bug' ? 'Bug reportado!' : 'Obrigado pelo feedback!'
          })
        }

        // Clear success message after 5 seconds
        setTimeout(() => setSubmitSuccess(null), 5000)
      }
    } catch (err) {
      console.error('Failed to submit:', err)
    }
    setSubmitting(false)
  }

  async function handleVote(itemId, currentVote) {
    try {
      const res = await fetch(`${API_BASE}/feedback/${itemId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          vote_type: 'up'
        })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to vote:', err)
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString()
  }

  function formatStatus(status) {
    return status.replace(/_/g, ' ')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-mark">B</div>
          <div>
            <div className="logo-text">
              <span>BumbleBee</span> Feedback
            </div>
            <div className="logo-subtitle">Voice AI Assistant for Mac & Windows</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="product-badge">
            Part of B2Bee.tech
          </div>
          <div className="credits-display">
            <span className="credits-icon">+</span>
            <span>{userCredits?.credits_balance || 0} honey</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '\u2600' : '\u263E'}
          </button>
        </div>
      </header>

      <div className="download-banner">
        <div className="download-content">
          <span className="download-label">Baixar BumbleBee:</span>
          <a
            href="https://github.com/Delta-Compute/bumblebee/actions/workflows/build-and-release.yml"
            className="download-btn windows"
            target="_blank"
            rel="noopener noreferrer"
          >
            Windows
          </a>
          <a
            href="https://github.com/Delta-Compute/bumblebee/actions/workflows/build-and-release.yml"
            className="download-btn mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mac
          </a>
          <span className="download-hint">(clique no build mais recente, depois em Artifacts)</span>
        </div>
      </div>

      <nav className="tabs">
        <button
          className={`tab wishlist ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Feature Requests
          <span className="tab-count">{stats?.wishlist_count || 0}</span>
        </button>
        <button
          className={`tab bug ${activeTab === 'bug' ? 'active' : ''}`}
          onClick={() => setActiveTab('bug')}
        >
          Bug Reports
          <span className="tab-count">{stats?.bug_count || 0}</span>
        </button>
      </nav>

      <main className="main">
        <section className="feed">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.total_items || 0}</div>
              <div className="stat-label">Total Feedback</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.completed_count || 0}</div>
              <div className="stat-label">Shipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.contributors_count || 0}</div>
              <div className="stat-label">Contributors</div>
            </div>
          </div>

          <div className="feed-header">
            <h2 className="feed-title">
              {activeTab === 'wishlist' ? 'What should BumbleBee do next?' : 'Help us squash bugs'}
            </h2>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rank">Top Ranked</option>
              <option value="votes">Most Votes</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {activeTab === 'wishlist' ? 'B' : '!'}
              </div>
              <div className="empty-state-title">
                No {activeTab === 'wishlist' ? 'feature requests' : 'bug reports'} yet
              </div>
              <p>Be the first to help shape BumbleBee!</p>
            </div>
          ) : (
            <div className="items-list">
              {items.map((item, index) => (
                <div key={item.id} className={`item-card ${item.item_type}`}>
                  <div className="item-header">
                    <h3 className="item-title">{item.title}</h3>
                    <span className="item-rank">#{index + 1}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <div className="item-footer">
                    <div className="item-meta">
                      <span className={`status-badge ${item.status}`}>
                        {formatStatus(item.status)}
                      </span>
                      <span>{formatDate(item.created_at)}</span>
                      <span>{item.comment_count || 0} comments</span>
                      {item.x_handle && <span>@{item.x_handle}</span>}
                    </div>
                    <button
                      className={`vote-btn ${item.item_type === 'bug' ? 'bug-vote' : ''} ${item.user_voted ? 'voted' : ''}`}
                      onClick={() => handleVote(item.id, item.user_voted)}
                    >
                      <span>{item.user_voted ? '-' : '+'}</span>
                      {item.vote_count}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              {formType === 'bug' ? 'Reportar Bug' : 'Compartilhar Ideia'}
            </h3>

            {submitSuccess && (
              <div className={`success-message ${submitSuccess.type}`}>
                <span>{submitSuccess.message}</span>
                {submitSuccess.issueUrl && (
                  <a href={submitSuccess.issueUrl} target="_blank" rel="noopener noreferrer">
                    Ver no GitHub
                  </a>
                )}
              </div>
            )}

            <form className="submit-form" onSubmit={handleSubmit}>
              <div className="type-selector">
                <button
                  type="button"
                  className={`type-btn wishlist ${formType === 'wishlist' ? 'active' : ''}`}
                  onClick={() => setFormType('wishlist')}
                >
                  Ideia
                </button>
                <button
                  type="button"
                  className={`type-btn bug ${formType === 'bug' ? 'active' : ''}`}
                  onClick={() => setFormType('bug')}
                >
                  Bug
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Plataforma</label>
                <div className="platform-selector">
                  <button
                    type="button"
                    className={`platform-btn ${formPlatform === 'windows' ? 'active' : ''}`}
                    onClick={() => setFormPlatform('windows')}
                  >
                    Windows
                  </button>
                  <button
                    type="button"
                    className={`platform-btn ${formPlatform === 'mac' ? 'active' : ''}`}
                    onClick={() => setFormPlatform('mac')}
                  >
                    Mac
                  </button>
                  <button
                    type="button"
                    className={`platform-btn ${formPlatform === 'both' ? 'active' : ''}`}
                    onClick={() => setFormPlatform('both')}
                  >
                    Ambos
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Titulo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={formType === 'bug' ? 'Ex: App trava ao abrir...' : 'Ex: Adicionar integracao com calendario...'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {formType === 'bug' ? 'O que aconteceu?' : 'Descricao'}
                </label>
                <textarea
                  className="form-textarea"
                  placeholder={formType === 'bug' ? 'Descreva o problema que encontrou...' : 'Descreva sua ideia para o BumbleBee...'}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              {formType === 'bug' && (
                <div className="form-group">
                  <label className="form-label">Passos para reproduzir (opcional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="1. Abri o app&#10;2. Cliquei em...&#10;3. O app travou"
                    value={formSteps}
                    onChange={(e) => setFormSteps(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Seu nome ou X/Twitter (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="@seuhandle ou seu nome"
                  value={formXHandle}
                  onChange={(e) => setFormXHandle(e.target.value.replace('@', ''))}
                  maxLength={50}
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting || !formTitle.trim() || !formDescription.trim()}
              >
                {submitting ? 'Enviando...' : (formType === 'bug' ? 'Reportar Bug (+15 honey)' : 'Enviar Ideia (+10 honey)')}
              </button>
            </form>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Top Contributors</h3>
            <div className="leaderboard">
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No contributors yet
                </p>
              ) : (
                leaderboard.map((user, index) => (
                  <div key={user.id} className="leaderboard-item">
                    <span className="leaderboard-rank">{index + 1}</span>
                    <div className="leaderboard-user">
                      <div className="leaderboard-name">
                        {user.x_handle ? `@${user.x_handle}` : user.user_id.slice(0, 12)}
                      </div>
                      <div className="leaderboard-handle">
                        {user.items_submitted} submissions
                      </div>
                    </div>
                    <span className="leaderboard-credits">+{user.credits_earned_total}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">How Ranking Works</h3>
            <div className="algorithm-card">
              {algorithm ? (
                <>
                  <div className="algorithm-version">{algorithm.version}</div>
                  <div className="algorithm-preview">
                    {algorithm.prompt_content.slice(0, 200)}...
                  </div>
                  {algorithm.github_url && (
                    <a
                      href={algorithm.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="algorithm-link"
                    >
                      View on GitHub
                    </a>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Loading...
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default BumbleBeeApp

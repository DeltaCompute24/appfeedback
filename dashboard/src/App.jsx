import { useState, useEffect } from 'react'

const API_BASE = '/api'

// Generate a simple user ID for demo (in production, use real auth)
const getUserId = () => {
  let userId = localStorage.getItem('appfeedback_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('appfeedback_user_id', userId)
  }
  return userId
}

const getInitialTheme = () => {
  const saved = localStorage.getItem('appfeedback_theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function App() {
  const [activeTab, setActiveTab] = useState('wishlist')
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [algorithm, setAlgorithm] = useState(null)
  const [userCredits, setUserCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('rank')
  const [theme, setTheme] = useState(getInitialTheme)

  // Form state
  const [formType, setFormType] = useState('wishlist')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formXHandle, setFormXHandle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const userId = getUserId()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('appfeedback_theme', theme)
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
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: formType,
          title: formTitle.trim(),
          description: formDescription.trim(),
          user_id: userId,
          x_handle: formXHandle.trim() || null
        })
      })
      if (res.ok) {
        setFormTitle('')
        setFormDescription('')
        fetchData()
        fetchStats()
        fetchUserCredits()
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
          <div className="logo-mark">AF</div>
          <div className="logo-text">AppFeedback <span>by B2Bee</span></div>
        </div>
        <div className="header-actions">
          <div className="credits-display">
            <span className="credits-icon">+</span>
            <span>{userCredits?.credits_balance || 0} credits</span>
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

      <nav className="tabs">
        <button
          className={`tab wishlist ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Wishlist
          <span className="tab-count">{stats?.wishlist_count || 0}</span>
        </button>
        <button
          className={`tab bug ${activeTab === 'bug' ? 'active' : ''}`}
          onClick={() => setActiveTab('bug')}
        >
          Bug Hunt
          <span className="tab-count">{stats?.bug_count || 0}</span>
        </button>
      </nav>

      <main className="main">
        <section className="feed">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.total_items || 0}</div>
              <div className="stat-label">Total Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.completed_count || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.contributors_count || 0}</div>
              <div className="stat-label">Contributors</div>
            </div>
          </div>

          <div className="feed-header">
            <h2 className="feed-title">
              {activeTab === 'wishlist' ? 'Feature Requests' : 'Bug Reports'}
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
                {activeTab === 'wishlist' ? '>' : '!'}
              </div>
              <div className="empty-state-title">
                No {activeTab === 'wishlist' ? 'feature requests' : 'bug reports'} yet
              </div>
              <p>Be the first to submit one!</p>
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
            <h3 className="sidebar-title">Submit Feedback</h3>
            <form className="submit-form" onSubmit={handleSubmit}>
              <div className="type-selector">
                <button
                  type="button"
                  className={`type-btn wishlist ${formType === 'wishlist' ? 'active' : ''}`}
                  onClick={() => setFormType('wishlist')}
                >
                  Feature
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
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief summary..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe in detail..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">X Handle (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="@yourhandle"
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
                {submitting ? 'Submitting...' : 'Submit Feedback'}
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
            <h3 className="sidebar-title">Ranking Algorithm</h3>
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
                  Loading algorithm...
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App

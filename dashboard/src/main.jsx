import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import BumbleBeeApp from './variations/BumbleBeeApp.jsx'
import './index.css'

// Check URL for variant parameter: ?variant=bumblebee
const params = new URLSearchParams(window.location.search)
const variant = params.get('variant')

// Use BumbleBee variant if specified
const AppComponent = variant === 'bumblebee' ? BumbleBeeApp : App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)

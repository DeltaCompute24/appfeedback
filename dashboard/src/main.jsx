import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import BumbleBeeApp from './variations/BumbleBeeApp.jsx'
import BumbleBeeLanding from './variations/BumbleBeeLanding.jsx'
import './index.css'

// Check URL for variant parameter or hostname
const params = new URLSearchParams(window.location.search)
const variant = params.get('variant')
const hostname = window.location.hostname

// Determine which app to show
let AppComponent = App

if (variant === 'bumblebee' || variant === 'feedback') {
  AppComponent = BumbleBeeApp
} else if (variant === 'landing' || hostname.includes('bumblebee.b2bee')) {
  AppComponent = BumbleBeeLanding
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)

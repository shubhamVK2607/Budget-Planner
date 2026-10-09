import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { SettingsProvider } from './shared/i18n/SettingsProvider'
import { applyTheme, loadSettings } from './services/settings'

// Pehle hi theme lagao, taaki dark mode me white flash na aaye
applyTheme(loadSettings().theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>
)
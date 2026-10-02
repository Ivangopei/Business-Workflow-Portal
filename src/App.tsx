import {BrowserRouter, Routes, Route, Link, useLocation} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Tasks from './pages/Tasks'
import FollowUps from './pages/FollowUps'
import Projects from './pages/Projects'
import Contacts from './pages/Contacts'
import Activity from './pages/Activity'
import Settings from './pages/Settings'
import './App.css'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'


function TopBar() {
  const location = useLocation()
  const { t } = useTranslation()

  const pageKeys: Record<string, string> = {
    '/': 'nav.dashboard',
    '/clients': 'nav.clients',
    '/tasks': 'nav.tasks',
    '/follow-ups': 'nav.followUps',
    '/projects': 'nav.projects',
    '/contacts': 'nav.contacts',
    '/activity': 'nav.activity',
    '/settings': 'nav.settings',
  }

  const pageKey = pageKeys[location.pathname]
  const pageName = pageKey ? t(pageKey) : 'Atlas'

  return (
    <div className="top-bar">
      <h2>{pageName}</h2>

      <div className="search-bar">
        <span>🔍</span>

        <input
          type="text"
          placeholder={t('topBar.searchPlaceholder')}
        />

        <button>{t('topBar.search')}</button>
      </div>
    </div>
  )
}


function App() {
  const { t } = useTranslation()

  return (
    <BrowserRouter>
      <div className="app">

        <aside className="sidebar">
          <h1>Atlas</h1>

          <nav>
            <h4>{t('nav.main')}</h4>

            <Link to="/">{t('nav.dashboard')}</Link>
            <Link to="/clients">{t('nav.clients')}</Link>
            <Link to="/tasks">{t('nav.tasks')}</Link>
            <Link to="/follow-ups">{t('nav.followUps')}</Link>

            <h4>{t('nav.work')}</h4>

            <Link to="/projects">{t('nav.projects')}</Link>
            <Link to="/contacts">{t('nav.contacts')}</Link>

            <h4>{t('nav.other')}</h4>

            <Link to="/activity">{t('nav.activity')}</Link>
            <Link to="/settings">{t('nav.settings')}</Link>
          </nav>

          <LanguageSwitcher />
        </aside>

        <main className="main-content">

          <TopBar />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

        </main>

      </div>
    </BrowserRouter>
  )
}

export default App
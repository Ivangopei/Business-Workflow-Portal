import {BrowserRouter, Routes, Route, Link, useLocation} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Tasks from './pages/Tasks'
import FollowUps from './pages/FollowUps'
import News from './pages/News'
import Projects from './pages/Projects'
import Contacts from './pages/Contacts'
import Documents from './pages/Documents'
import Activity from './pages/Activity'
import Settings from './pages/Settings'
import './App.css'


function TopBar() {
  const location = useLocation()

  const pageNames: Record<string, string> = {
    '/': 'Dashboard',
    '/clients': 'Clients',
    '/tasks': 'Tasks',
    '/follow-ups': 'Follow-ups',
    '/news': 'News',
    '/projects': 'Projects',
    '/contacts': 'Contacts',
    '/activity': 'Activity',
    '/settings': 'Settings',
  }

  const pageName = pageNames[location.pathname] || 'Atlas'

  return (
    <div className="top-bar">
      <h2>{pageName}</h2>

      <div className="search-bar">
        <span>🔍</span>

        <input
          type="text"
          placeholder="Search clients, contacts, tasks..."
        />

        <button>Search</button>
      </div>
    </div>
  )
}


function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <aside className="sidebar">
          <h1>Atlas</h1>

          <nav>
            <h4>Main</h4>

            <Link to="/">Dashboard</Link>
            <Link to="/clients">Clients</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/follow-ups">Follow-ups</Link>
            <Link to="/news">News</Link>
            <h4>Work</h4>

            <Link to="/projects">Projects</Link>
            <Link to="/contacts">Contacts</Link>
            <Link to="/documents">Documents</Link>

            <h4>Other</h4>

            <Link to="/activity">Activity</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </aside>


        <main className="main-content">

          <TopBar />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/news" element={<News />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

        </main>

      </div>
    </BrowserRouter>
  )
}

export default App
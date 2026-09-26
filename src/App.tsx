import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Tasks from './pages/Tasks'
import FollowUps from './pages/FollowUps'
import Projects from './pages/Projects'
import Contacts from './pages/Contacts'
import Activity from './pages/Activity'
import Settings from './pages/Settings'
import './App.css'

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

            <h4>Work</h4>
            <Link to="/projects">Projects</Link>
            <Link to="/contacts">Contacts</Link>

            <h4>Other</h4>
            <Link to="/activity">Activity</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">

          <div className="top-bar">
            <div className="search-bar">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search clients, contacts, tasks..."
              />

              <button>Search</button>
            </div>
          </div>

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
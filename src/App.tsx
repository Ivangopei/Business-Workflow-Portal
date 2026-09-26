import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Tasks from './pages/Tasks'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <aside className="sidebar">
          <h1>Atlas</h1>

          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/clients">Clients</Link>
            <Link to="/tasks">Tasks</Link>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App
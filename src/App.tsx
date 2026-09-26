import './App.css'

function App() {
  return (
    <div>

      <div>

        <div>
          <h1>Atlas</h1>
          <nav>
            <a href="#">Dashboard</a>
            <a href="#">Clients</a>
            <a href="#">Tasks</a>
          </nav>
        </div>

        <div>
          <h2>Welcome, Ivan</h2>
          <p>Your business workflow dashboard</p>
        </div>

      </div>

      <div>
        <h3>Today's Tasks</h3>

        <ul>
          <li>Call ABC Manufacturing</li>
          <li>Follow up with John</li>
          <li>Review candidate applications</li>
        </ul>

        <p>3 tasks remaining today.</p>
        <p>Next follow-up: ABC Manufacturing — tomorrow at 10:00 AM.</p>
        <p>Waiting for: John to send job positions.</p>
      </div>

    </div>
  )
}

export default App
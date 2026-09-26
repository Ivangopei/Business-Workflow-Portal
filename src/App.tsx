import './App.css'

function App() {
  return (
    <div className="app">

      <aside className="sidebar">
        <h1>Atlas</h1>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Clients</a>
          <a href="#">Tasks</a>
        </nav>
      </aside>

      <main className="main-content">

        <section className="welcome">
          <h2>Welcome, Ivan</h2>
          <p>Your business workflow dashboard</p>
        </section>

        <section>
          <h3>Today's Tasks</h3>
          <p>Call ABC Manufacturing</p>
          <p>Follow up with John</p>
          <p>Review candidate applications</p>
        </section>

        <section>
          <h3>Clients</h3>
          <p>ABC Manufacturing - Active</p>
          <p>XYZ Logistics - Waiting</p>
          <p>Acme Construction - Active</p>
        </section>

        <section>
          <h3>Waiting For</h3>
          <p>John - Job positions - 2 days</p>
          <p>ABC Manufacturing - Candidate feedback - 4 days</p>
        </section>

      </main>

    </div>
  )
}

export default App
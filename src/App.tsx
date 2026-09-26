import './App.css'

function App() {
  return (
    <div>

      <header>
        <h1>Atlas</h1>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Clients</a>
          <a href="#">Tasks</a>
        </nav>
      </header>

      <main>

        <section>
          <h2>Welcome, Ivan</h2>
          <p>Here is what needs your attention today.</p>
        </section>

        <section>
          <h3>Today</h3>
          <p>3 tasks due today</p>
          <p>1 client needs a follow-up</p>
          <p>2 items are waiting for a response</p>
        </section>

        <section>
          <h3>Upcoming Tasks</h3>
          <p>Call ABC Manufacturing - Today</p>
          <p>Follow up with John - Tomorrow</p>
          <p>Send candidates to XYZ Logistics - Friday</p>
        </section>

        <section>
          <h3>Clients</h3>
          <p>ABC Manufacturing - Active</p>
          <p>XYZ Logistics - Waiting for response</p>
          <p>Acme Construction - Active</p>
        </section>

        <section>
          <h3>Waiting For</h3>
          <p>John - Job positions - 2 days</p>
          <p>ABC Manufacturing - Candidate feedback - 4 days</p>
        </section>

        <section>
          <h3>Recent Activity</h3>
          <p>Spoke with John - Today</p>
          <p>Added ABC Manufacturing - Yesterday</p>
          <p>Sent candidates to Acme Construction - Yesterday</p>
        </section>

      </main>

    </div>
  )
}

export default App
type NewsTopic = 'immigration' | 'labor' | 'hiring' | 'compliance'

type NewsArticle = {
  id: number
  title: string
  summary: string
  source: string
  date: string
  topic: NewsTopic
  relevantTo?: string[]
}

const articles: NewsArticle[] = [
  { id: 1, title: 'Employers report longer wait times for work visa processing', summary: 'Several staffing firms say applications filed this summer are taking weeks longer than expected. What it could mean for planned start dates.', source: 'Workforce Policy Weekly', date: 'Oct 2', topic: 'immigration', relevantTo: ['Global Foods'] },
  { id: 2, title: 'What new overtime rules could mean for warehouse employers', summary: 'A look at how proposed changes to overtime eligibility would affect shift planning and payroll in logistics.', source: 'Employer Compliance Digest', date: 'Oct 1', topic: 'labor', relevantTo: ['XYZ Logistics'] },
  { id: 3, title: 'Manufacturing hiring stays strong heading into Q4', summary: 'Regional manufacturers continue to add machine operators and line workers, with many relying on staffing partners to fill roles quickly.', source: 'Regional Business Journal', date: 'Sep 30', topic: 'hiring', relevantTo: ['ABC Manufacturing', 'Midwest Industries'] },
  { id: 4, title: "Checklist: documents to collect before a new hire's first day", summary: 'From tax forms to signed agreements, a practical list of the paperwork employers should have on file before onboarding.', source: 'Employer Compliance Digest', date: 'Sep 29', topic: 'compliance' },
  { id: 5, title: "Seasonal work programs prepare for next year's demand", summary: 'Employers in agriculture and food processing are planning earlier than usual to secure seasonal workers for spring.', source: 'Workforce Policy Weekly', date: 'Sep 28', topic: 'immigration' },
  { id: 6, title: 'State minimum wage changes taking effect in January', summary: 'Several states will raise their minimum wage at the start of the year. Here is what employers should update now.', source: 'Delaware Business Report', date: 'Sep 26', topic: 'labor' },
  { id: 7, title: 'Construction firms turn to staffing partners as projects ramp up', summary: 'With new projects starting this fall, construction companies are looking outside their usual networks to find skilled labor.', source: 'Regional Business Journal', date: 'Sep 25', topic: 'hiring', relevantTo: ['Acme Construction'] },
  { id: 8, title: "Workers' comp certificates: common renewal mistakes", summary: 'Missed renewal dates are one of the most common compliance gaps. How to keep certificates current for every client.', source: 'Employer Compliance Digest', date: 'Sep 24', topic: 'compliance', relevantTo: ['Midwest Industries'] },
]

const topicLabels: Record<NewsTopic, string> = {
  immigration: 'Immigration',
  labor: 'Labor law',
  hiring: 'Hiring',
  compliance: 'Compliance',
}

function News() {
  return (
    <div className="news-page">

      <div className="page-header">
        <p className="page-description">
          Recent updates on immigration, labor, and hiring that could affect your clients.
        </p>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">All</button>
          <button className="status-tab">Immigration</button>
          <button className="status-tab">Labor law</button>
          <button className="status-tab">Hiring</button>
          <button className="status-tab">Compliance</button>
        </div>

        <input type="text" placeholder="Search news..." />
      </div>

      <p className="sample-note">
        Sample headlines for the prototype. Real articles will come from news feeds later.
      </p>

      <div className="news-list">
        {articles.map((article) => (
          <article className="news-card" key={article.id}>
            <div className="news-meta">
              <span className={`topic-pill topic-${article.topic}`}>
                {topicLabels[article.topic]}
              </span>
              <span>{article.source}</span>
              <span>{article.date}</span>
            </div>

            <h3 className="news-title">{article.title}</h3>
            <p className="news-summary">{article.summary}</p>

            <div className="news-footer">
              {article.relevantTo ? (
                <div className="news-relevant">
                  <span className="news-relevant-label">Relevant to</span>
                  {article.relevantTo.map((client) => (
                    <span className="client-chip" key={client}>{client}</span>
                  ))}
                </div>
              ) : (
                <div />
              )}

              <a className="read-link" href="#">Read article</a>
            </div>
          </article>
        ))}
      </div>

    </div>
  )
}

export default News
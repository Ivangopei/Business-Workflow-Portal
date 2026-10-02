import { useTranslation } from 'react-i18next'

function Settings() {
  const { t, i18n } = useTranslation()

  return (
    <div className="settings-page">

      <div className="page-header">
        <p className="page-description">
          Manage your profile, business details, and how Atlas works for you.
        </p>
      </div>

      <section className="settings-card">
        <div className="settings-card-info">
          <h3>Profile</h3>
          <p>Your personal details.</p>
        </div>

        <div className="settings-fields">
          <div className="form-field">
            <label htmlFor="full-name">Full name</label>
            <input id="full-name" type="text" defaultValue="Ivan" />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" defaultValue="ivan@example.com" />
          </div>

          <div className="form-field">
            <label htmlFor="role">Role</label>
            <select id="role" defaultValue="admin">
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-info">
          <h3>{t('settings.language.title')}</h3>
          <p>{t('settings.language.description')}</p>
        </div>

        <div className="settings-fields">
          <div className="form-field">
            <label htmlFor="language">{t('settings.language.label')}</label>
            <select
              id="language"
              value={i18n.resolvedLanguage}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-info">
          <h3>Business</h3>
          <p>Used for due dates, reminders, and overdue items.</p>
        </div>

        <div className="settings-fields">
          <div className="form-field">
            <label htmlFor="company">Company name</label>
            <input id="company" type="text" defaultValue="Keystone Staffing Group" />
          </div>

          <div className="form-field">
            <label htmlFor="timezone">Time zone</label>
            <select id="timezone" defaultValue="eastern">
              <option value="eastern">Eastern Time (ET)</option>
              <option value="central">Central Time (CT)</option>
              <option value="mountain">Mountain Time (MT)</option>
              <option value="pacific">Pacific Time (PT)</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="hours-start">Business hours</label>
            <div className="form-inline">
              <input id="hours-start" type="time" defaultValue="09:00" />
              <span>to</span>
              <input id="hours-end" type="time" defaultValue="17:00" aria-label="Business hours end" />
            </div>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-info">
          <h3>Workflow defaults</h3>
          <p>Starting values for new tasks and follow-ups.</p>
        </div>

        <div className="settings-fields">
          <div className="form-field">
            <label htmlFor="default-priority">Default task priority</label>
            <select id="default-priority" defaultValue="medium">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="default-method">Default follow-up method</label>
            <select id="default-method" defaultValue="call">
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="waiting-days">Suggest a follow-up when a task has been waiting for</label>
            <div className="form-inline">
              <input id="waiting-days" type="number" min="1" defaultValue="3" className="input-short" />
              <span>days</span>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-info">
          <h3>Notifications</h3>
          <p>Choose what Atlas emails you about.</p>
        </div>

        <div className="settings-fields">
          <label className="toggle-row">
            <span className="toggle-text">
              <span className="toggle-title">Daily summary</span>
              <span className="toggle-description">Tasks and follow-ups due today, every morning.</span>
            </span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>

          <label className="toggle-row">
            <span className="toggle-text">
              <span className="toggle-title">Overdue alerts</span>
              <span className="toggle-description">An email when a task or follow-up becomes overdue.</span>
            </span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>

          <label className="toggle-row">
            <span className="toggle-text">
              <span className="toggle-title">Weekly report</span>
              <span className="toggle-description">A summary of completed work every Friday.</span>
            </span>
            <input type="checkbox" className="toggle" />
          </label>
        </div>
      </section>

      <div className="settings-actions">
        <button className="secondary-button">Cancel</button>
        <button>Save changes</button>
      </div>

    </div>
  )
}

export default Settings
function Contacts() {
  const contacts = [
    {
      name: 'John Smith',
      company: 'ABC Manufacturing',
      role: 'HR Manager',
      email: 'john@abcmanufacturing.com',
      phone: '(555) 123-4567',
    },
    {
      name: 'Sarah Miller',
      company: 'XYZ Logistics',
      role: 'Recruiter',
      email: 'sarah@xyzlogistics.com',
      phone: '(555) 234-5678',
    },
    {
      name: 'Mike Johnson',
      company: 'Global Foods',
      role: 'Owner',
      email: 'mike@globalfoods.com',
      phone: '(555) 345-6789',
    },
    {
      name: 'Emily Davis',
      company: 'Midwest Industries',
      role: 'Operations Manager',
      email: 'emily@midwestindustries.com',
      phone: '(555) 456-7890',
    },
  ]

  return (
    <div className="contacts-page">

      <div className="page-header">
        <div>
          <p className="page-description">
            Manage the people you work with.
          </p>
        </div>

        <button>+ Add Contact</button>
      </div>

      <div className="contact-filters">
        <input
          type="text"
          placeholder="Search contacts..."
        />

        <select>
          <option>All Companies</option>
          <option>ABC Manufacturing</option>
          <option>XYZ Logistics</option>
          <option>Global Foods</option>
          <option>Midwest Industries</option>
        </select>
      </div>

      <div className="contacts-table-container">

        <table className="contacts-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Role</th>
              <th>Contact</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.email}>
                <td>
                  <div className="contact-name">
                    {contact.name}
                  </div>
                </td>

                <td>
                  {contact.company}
                </td>

                <td>
                  {contact.role}
                </td>

                <td>
                  <div className="contact-info">
                    <span>{contact.email}</span>
                    <span>{contact.phone}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Contacts
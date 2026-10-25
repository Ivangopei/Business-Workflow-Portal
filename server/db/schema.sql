-- Delete tables and dependent objects if they exist, so I can re-create them from scratch with any new changes.
DROP TABLE IF EXISTS documents, follow_ups, tasks, projects, contacts, clients CASCADE;

-- Clients tab
CREATE TABLE clients (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('business', 'individual')),
  industry    TEXT,                       -- empty for individuals
  location    TEXT,
  status      TEXT NOT NULL DEFAULT 'onboarding'
              CHECK (status IN ('active', 'waiting', 'onboarding')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contacts tab
CREATE TABLE contacts (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id          INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  role               TEXT,
  email              TEXT,
  phone              TEXT,
  is_primary         BOOLEAN NOT NULL DEFAULT false,
  last_contacted_on  DATE
);

-- Only one contact per client
CREATE UNIQUE INDEX one_primary_contact_per_client
  ON contacts (client_id) WHERE is_primary;

-- Projects tab
CREATE TABLE projects (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  program     TEXT NOT NULL CHECK (program IN ('h2a', 'h2b', 'eb3')),
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'on-hold', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks tab
CREATE TABLE tasks (
  id                     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id              INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id             INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  title                  TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'todo'
                         CHECK (status IN ('todo', 'in-progress', 'waiting', 'done')),
  priority               TEXT NOT NULL DEFAULT 'medium'
                         CHECK (priority IN ('high', 'medium', 'low')),
  due_date               DATE,
  waiting_on_contact_id  INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A waiting task must say who it is waiting on
  CONSTRAINT waiting_needs_contact
    CHECK (status <> 'waiting' OR waiting_on_contact_id IS NOT NULL)
);

-- Follow ups tab
CREATE TABLE follow_ups (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contact_id    INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  method        TEXT NOT NULL CHECK (method IN ('call', 'email', 'meeting')),
  due_at        TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ
);

-- Documents tab
CREATE TABLE documents (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('received', 'waiting', 'missing')),
  file_name        TEXT,
  file_size_bytes  INTEGER,
  file_path        TEXT,      
  requested_on     DATE,
  uploaded_on      DATE,
  expires_on       DATE
);

-- Speed up the most common lookups ("everything for this client")
CREATE INDEX ON contacts (client_id);
CREATE INDEX ON projects (client_id);
CREATE INDEX ON tasks (client_id);
CREATE INDEX ON tasks (project_id);
CREATE INDEX ON follow_ups (contact_id);
CREATE INDEX ON documents (client_id);
-- 1. Every task with its client and project name (JOIN)
SELECT t.title, c.name AS client, p.name AS project, t.status, t.due_date
FROM tasks t
JOIN clients c ON c.id = t.client_id
LEFT JOIN projects p ON p.id = t.project_id
ORDER BY t.due_date;

-- 2. Project cards: counts and progress, calculated from tasks (GROUP BY)
SELECT
  p.name,
  c.name AS client,
  p.program,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'done') AS completed,
  COUNT(t.id) FILTER (WHERE t.status = 'waiting') AS waiting,
  ROUND(100.0 * COUNT(t.id) FILTER (WHERE t.status = 'done') / NULLIF(COUNT(t.id), 0)) AS progress
FROM projects p
JOIN clients c ON c.id = p.client_id
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, c.name
ORDER BY p.id;

-- 3. Dashboard "Waiting On": who is holding things up, and for how long
SELECT t.title, ct.name AS waiting_on, c.name AS client, t.due_date
FROM tasks t
JOIN contacts ct ON ct.id = t.waiting_on_contact_id
JOIN clients c ON c.id = t.client_id
WHERE t.status = 'waiting';

-- 4. Overdue tasks, calculated instead of stored
SELECT title, due_date
FROM tasks
WHERE due_date < CURRENT_DATE AND status <> 'done';

-- 5. Clients page: programs per client come from their projects
SELECT c.name, c.type, string_agg(DISTINCT p.program, ', ') AS programs
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
GROUP BY c.id
ORDER BY c.id;
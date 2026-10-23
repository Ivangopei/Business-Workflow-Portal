export type TaskStatus = 'todo' | 'in-progress' | 'waiting' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export type Task = {
  id: number
  title: string
  client: string
  project?: string
  status: TaskStatus
  priority: TaskPriority
  due: string
  overdue?: boolean
  waitingOn?: string
}

export const initialTasks: Task[] = [
  { id: 1, title: 'Call John Smith about open positions', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'in-progress', priority: 'high', due: 'Today, 10:00 AM' },
  { id: 2, title: 'Review candidate documents', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'todo', priority: 'high', due: 'Today, 2:00 PM' },
  { id: 3, title: 'Send candidate list to John Smith', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'todo', priority: 'medium', due: 'Tomorrow' },
  { id: 4, title: 'Get signed job descriptions', client: 'XYZ Logistics', project: 'XYZ Logistics Recruitment', status: 'waiting', priority: 'high', due: 'Sep 25', overdue: true, waitingOn: 'Sarah Miller' },
  { id: 5, title: 'Schedule interviews for warehouse roles', client: 'XYZ Logistics', project: 'XYZ Logistics Recruitment', status: 'todo', priority: 'medium', due: 'Oct 2' },
  { id: 6, title: 'Confirm start dates for new hires', client: 'Global Foods', project: 'Global Foods Expansion', status: 'waiting', priority: 'medium', due: 'Today', waitingOn: 'Mike Johnson' },
  { id: 7, title: 'Prepare onboarding packet', client: 'Global Foods', project: 'Global Foods Expansion', status: 'in-progress', priority: 'low', due: 'Oct 5' },
  { id: 8, title: 'Collect shift requirements', client: 'Midwest Industries', project: 'Midwest Industries Staffing', status: 'waiting', priority: 'medium', due: 'Sep 26', overdue: true, waitingOn: 'Emily Davis' },
  { id: 9, title: 'Post openings for machine operators', client: 'Midwest Industries', project: 'Midwest Industries Staffing', status: 'todo', priority: 'high', due: 'Today, 4:00 PM' },
  { id: 10, title: 'Kickoff call with Acme Construction', client: 'Acme Construction', status: 'todo', priority: 'medium', due: 'Oct 1' },
  { id: 11, title: 'Send welcome email to David Lee', client: 'Acme Construction', status: 'done', priority: 'low', due: 'Sep 24' },
  { id: 12, title: 'Follow up on background checks', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'todo', priority: 'low', due: 'Oct 1' },
  { id: 13, title: 'Update hiring timeline', client: 'Global Foods', project: 'Global Foods Expansion', status: 'todo', priority: 'low', due: 'Oct 6' },
  { id: 14, title: 'Sign service agreement', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'done', priority: 'high', due: 'Sep 12' },
  { id: 15, title: 'Collect job descriptions', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'done', priority: 'medium', due: 'Sep 15' },
  { id: 16, title: 'Kickoff meeting with Sarah Miller', client: 'XYZ Logistics', project: 'XYZ Logistics Recruitment', status: 'done', priority: 'medium', due: 'Sep 10' },
  { id: 17, title: 'Gather company documents', client: 'Global Foods', project: 'Global Foods Expansion', status: 'done', priority: 'high', due: 'Sep 8' },
  { id: 18, title: 'Confirm number of open roles', client: 'Global Foods', project: 'Global Foods Expansion', status: 'done', priority: 'medium', due: 'Sep 14' },
  { id: 19, title: 'Intro call with Emily Davis', client: 'Midwest Industries', project: 'Midwest Industries Staffing', status: 'done', priority: 'low', due: 'Sep 16' },
]
import { initialTasks } from './tasks'

export type ProjectStatus = 'active' | 'on-hold' | 'completed'
export type Program = 'h2a' | 'h2b' | 'eb3'

export type Project = {
  id: number
  name: string
  client: string
  program: Program
  status: ProjectStatus
}

export const initialProjects: Project[] = [
  { id: 1, name: 'ABC Manufacturing Hiring', client: 'ABC Manufacturing', program: 'h2b', status: 'active' },
  { id: 2, name: 'XYZ Logistics Recruitment', client: 'XYZ Logistics', program: 'h2b', status: 'active' },
  { id: 3, name: 'Global Foods Expansion', client: 'Global Foods', program: 'h2a', status: 'active' },
  { id: 4, name: 'Midwest Industries Staffing', client: 'Midwest Industries', program: 'eb3', status: 'active' },
]

// Shared by the Projects page and the project detail page.
export const programLabels: Record<Program, string> = {
  h2a: 'H-2A',
  h2b: 'H-2B',
  eb3: 'EB-3',
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  'on-hold': 'On hold',
  completed: 'Completed',
}

// Counts for one project, calculated from its tasks instead of typed in by hand.
export function getProjectStats(project: Project) {
  const projectTasks = initialTasks.filter((task) => task.project === project.name)
  const completed = projectTasks.filter((task) => task.status === 'done').length
  const waiting = projectTasks.filter((task) => task.status === 'waiting').length
  const progress = projectTasks.length === 0 ? 0 : Math.round((completed / projectTasks.length) * 100)

  return { projectTasks, total: projectTasks.length, completed, waiting, progress }
}
export interface AgentConfig {
  id: string
  name: string
  role: string
  color: string
  position: { x: number; y: number }
  workstation: string
}

export const AGENTS: AgentConfig[] = [
  {
    id: 'travis',
    name: 'Travis',
    role: 'System Coordinator',
    color: '#1E3A8A',
    position: { x: 10, y: 1 },
    workstation: '指揮中心'
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Data Analyst',
    color: '#0E7490',
    position: { x: 5, y: 4 },
    workstation: '數據牆'
  },
  {
    id: 'inspector',
    name: 'Inspector',
    role: 'Quality Assurance',
    color: '#1a1a1a',
    position: { x: 15, y: 4 },
    workstation: '品管室'
  },
  {
    id: 'secretary',
    name: 'Secretary',
    role: 'Office Manager',
    color: '#92400E',
    position: { x: 3, y: 8 },
    workstation: '接待區'
  },
  {
    id: 'coder',
    name: 'Coder',
    role: 'Software Engineer',
    color: '#10B981',
    position: { x: 17, y: 8 },
    workstation: '實驗室'
  },
  {
    id: 'writer',
    name: 'Writer',
    role: 'Content Creator',
    color: '#78350F',
    position: { x: 5, y: 12 },
    workstation: '寫作間'
  },
  {
    id: 'designer',
    name: 'Designer',
    role: 'UI/UX Designer',
    color: '#8B5CF6',
    position: { x: 15, y: 12 },
    workstation: '工作室'
  },
  {
    id: 'analyst',
    name: 'Analyst',
    role: 'Financial Analyst',
    color: '#B45309',
    position: { x: 10, y: 16 },
    workstation: '交易室'
  }
]

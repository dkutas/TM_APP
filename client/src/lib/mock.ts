
import type {Issue, Project, User} from './types';

const users: User[] = [
  { id: 'u1', name: 'Alice Kovács', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob Nagy', email: 'bob@example.com' },
  { id: 'u3', name: 'Carol Szabó', email: 'carol@example.com' },
];

const projects: Project[] = [
  { id: 'p1', key: 'DEMO', name: 'Demo Project', description: 'Sample demo project', users: users.slice(0,2) },
  { id: 'p2', key: 'WFL', name: 'Workflow Lab', description: 'Workflow testing', users },
];

const now = new Date();
function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const issues: Issue[] = [
  { id: 'i1', key: 'DEMO-1', projectId: 'p1', summary: 'Frontend redesign', description: 'Update list UI', status: 'IN_PROGRESS', priority: 'High', reporterId: 'u1', assigneeId: 'u2', createdAt: daysAgo(7), updatedAt: daysAgo(1) },
  { id: 'i2', key: 'DEMO-2', projectId: 'p1', summary: 'Add login page', status: 'TODO', priority: 'Medium', reporterId: 'u2', createdAt: daysAgo(10), updatedAt: daysAgo(8) },
  { id: 'i3', key: 'WFL-5', projectId: 'p2', summary: 'Workflow guard bug', status: 'DONE', priority: 'Low', reporterId: 'u3', assigneeId: 'u1', createdAt: daysAgo(20), updatedAt: daysAgo(2) },
];

export const db = { users, projects, issues };

// Simulated API
export const api = {
  async listProjects() {
    await new Promise(r => setTimeout(r, 200));
    return projects;
  },
  async getProject(id: string) {
    await new Promise(r => setTimeout(r, 200));
    return projects.find(p => p.id === id)!;
  },
  async listIssues(filter?: {projectId?: string}) {
    await new Promise(r => setTimeout(r, 200));
    let out = issues;
    if (filter?.projectId) out = out.filter(i => i.projectId === filter.projectId);
    return out;
  },
  async getIssue(id: string) {
    await new Promise(r => setTimeout(r, 200));
    return issues.find(i => i.id === id)!;
  }
}

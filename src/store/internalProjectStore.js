import { create } from 'zustand'
import {
  fetchInternalProjects, createInternalProject, updateInternalProject, deleteInternalProject,
  fetchInternalTasks, createInternalTask, updateInternalTask, deleteInternalTask,
} from '../lib/api/internalProjects'

export const useInternalProjectStore = create((set, get) => ({
  projects: [],
  tasks:    [],
  loading:  false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const projects = await fetchInternalProjects()
      set({ projects, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchTasks: async (projectId) => {
    const tasks = await fetchInternalTasks(projectId)
    set(s => {
      const other = s.tasks.filter(t => t.projectId !== projectId)
      return { tasks: [...other, ...tasks] }
    })
  },

  addProject: async (data) => {
    const p = await createInternalProject(data)
    set(s => ({ projects: [p, ...s.projects] }))
    return p
  },

  updateProject: async (id, patch) => {
    set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p) }))
    await updateInternalProject(id, patch)
  },

  deleteProject: async (id) => {
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      tasks:    s.tasks.filter(t => t.projectId !== id),
    }))
    await deleteInternalProject(id)
  },

  addTask: async (data) => {
    const t = await createInternalTask(data)
    set(s => ({ tasks: [...s.tasks, t] }))
    return t
  },

  updateTask: async (id, patch) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }))
    await updateInternalTask(id, patch)
  },

  deleteTask: async (id) => {
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
    await deleteInternalTask(id)
  },
}))

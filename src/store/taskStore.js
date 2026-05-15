import { create } from 'zustand'
import { fetchTasks, createTask, updateTaskStatus as apiUpdateStatus } from '../lib/api/tasks'

export const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (filters) => {
    set({ loading: true, error: null })
    try {
      const tasks = await fetchTasks(filters)
      set({ tasks, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  updateTaskStatus: async (taskId, status) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    }))
    await apiUpdateStatus(taskId, status)
  },

  addTask: async (task) => {
    const newTask = await createTask(task)
    set(state => ({ tasks: [...state.tasks, newTask] }))
    return newTask
  },
}))

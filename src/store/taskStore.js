import { create } from 'zustand'
import { fetchTasks, createTask, updateTaskStatus as apiUpdateStatus, updateTask as apiUpdateTask } from '../lib/api/tasks'
import { useCreatorStore } from './creatorStore'

export const useTaskStore = create((set, get) => ({
  tasks:   [],
  loading: false,
  error:   null,

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

  updateTask: async (taskId, data) => {
    const prev = get().tasks.find(t => t.id === taskId)
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...data } : t),
    }))
    await apiUpdateTask(taskId, data)
    if (data.status === 'Completed' && prev?.status !== 'Completed') {
      await useCreatorStore.getState().awardCoins(prev.creatorId, data.coins ?? prev.coins)
    }
  },

  addTask: async (task) => {
    const newTask = await createTask(task)
    set(state => ({ tasks: [...state.tasks, newTask] }))
    return newTask
  },
}))

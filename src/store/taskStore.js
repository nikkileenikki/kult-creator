import { create } from 'zustand'
import { TASKS } from '../lib/data'

export const useTaskStore = create((set) => ({
  tasks: TASKS,

  updateTaskStatus: (taskId, status) =>
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    })),

  addTask: (task) =>
    set(state => ({
      tasks: [...state.tasks, { ...task, id: `t${Date.now()}` }],
    })),
}))

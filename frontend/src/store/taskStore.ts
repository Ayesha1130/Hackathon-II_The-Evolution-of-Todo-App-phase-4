import { create } from 'zustand';
import { api } from '@/lib/api/client';

// Define the task type
interface Task {
  id: string;
  description: string;
  is_completed: boolean;
  priority: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Define the store state and actions
interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: { description: string; priority?: string; category_id?: string }) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<Task>;
  setTasks: (tasks: Task[]) => void;
}

// Create the store
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.getTasks();
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const newTask = await api.createTask(taskData);
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const updatedTask = await api.updateTask(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
      }));
      return updatedTask;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  toggleTaskCompletion: async (id) => {
    try {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) throw new Error('Task not found');

      const updatedTask = await api.toggleTask(id, !task.is_completed);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
      }));
      return updatedTask;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setTasks: (tasks) => set({ tasks }),
}));
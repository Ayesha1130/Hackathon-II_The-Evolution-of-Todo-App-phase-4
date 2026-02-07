'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Modal } from '@/components/ui/Modal'
import { useTaskStore } from '@/store/taskStore'
import { Plus, LayoutGrid, CheckCircle2, Clock, PieChart } from 'lucide-react'
import type { Task } from '@/types'

export default function DashboardPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  // Use the Zustand store for tasks
  const { tasks, loading, fetchTasks, toggleTaskCompletion, deleteTask } = useTaskStore()

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Filter tasks based on status filter
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'active') return !task.is_completed
    if (statusFilter === 'completed') return task.is_completed
    return true // 'all' or undefined
  })

  const handleToggleTask = async (task: Task) => {
    await toggleTaskCompletion(task.id)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    await deleteTask(taskId)
  }

  const getPriorityVariant = (priority: string): 'high' | 'medium' | 'low' => {
    switch (priority) {
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'medium'
    }
  }

  // Calculate stats based on all tasks
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.is_completed).length
  const activeTasks = totalTasks - completedTasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-100 tracking-tight">Dashboard</h1>
          <p className="text-blue-400 font-medium italic mt-1">Keep growing, one task at a time.</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-6 shadow-xl shadow-blue-500/20 font-bold transition-all hover:-translate-y-1 active:scale-95 glass-button"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<LayoutGrid size={20}/>} label="Total" value={totalTasks} color="glass-card p-6" />
        <StatCard icon={<CheckCircle2 size={20}/>} label="Done" value={completedTasks} color="glass-card p-6" />
        <StatCard icon={<Clock size={20}/>} label="Active" value={activeTasks} color="glass-card p-6" />
        <StatCard icon={<PieChart size={20}/>} label="Progress" value={`${completionPercentage}%`} color="glass-card p-6 bg-blue-600 text-white shadow-lg shadow-blue-500/30" />
      </div>

      {/* Filters & Content Area */}
      <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border border-gray-600">
        <div className="flex items-center gap-2 mb-8 glass bg-gray-700/30 p-1.5 rounded-2xl w-fit">
          <FilterButton active={statusFilter === undefined} label="All" onClick={() => setStatusFilter(undefined)} />
          <FilterButton active={statusFilter === 'active'} label="Active" onClick={() => setStatusFilter('active')} />
          <FilterButton active={statusFilter === 'completed'} label="Completed" onClick={() => setStatusFilter('completed')} />
        </div>

        {/* Tasks List Component */}
        <div className="min-h-[400px]">
          <TaskList
            tasks={filteredTasks}
            isLoading={loading}
            onEdit={setEditingTask}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            getPriorityVariant={getPriorityVariant}
          />
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Task">
        <div className="glass-modal p-6 rounded-xl">
          <TaskForm onClose={() => setShowAddModal(false)} onSuccess={() => setShowAddModal(false)} />
        </div>
      </Modal>

      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <div className="glass-modal p-6 rounded-xl">
            <TaskForm task={editingTask} onClose={() => setEditingTask(null)} onSuccess={() => setEditingTask(null)} />
          </div>
        )}
      </Modal>
    </div>
  )
}

// Custom Styled Components for Cleanliness
function StatCard({ label, value, color, icon, shadow }: any) {
  return (
    <Card className={`${color} border-none rounded-[2rem] transition-transform hover:scale-105 duration-300 matte-black-card`}>
      <div className="flex flex-col gap-1">
        <div className="opacity-80 mb-2 text-blue-400">{icon}</div>
        <div className="text-3xl font-black tracking-tight text-white">{value}</div>
        <div className="text-xs font-bold uppercase tracking-widest opacity-70 text-gray-300">{label}</div>
      </div>
    </Card>
  )
}

function FilterButton({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm glass-button'
          : 'text-gray-400 hover:text-blue-400 glass-button'
      }`}
    >
      {label}
    </button>
  )
}
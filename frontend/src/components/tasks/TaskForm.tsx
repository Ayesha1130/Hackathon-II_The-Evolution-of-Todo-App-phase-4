'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { useTaskStore } from '@/store/taskStore'
import type { Task, TaskPriority } from '@/types'

const taskSchema = z.object({
  description: z.string().min(1, 'Description is required').max(1000),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task | null
  onClose: () => void
  onSuccess?: () => void
}

export function TaskForm({ task, onClose, onSuccess }: TaskFormProps) {
  const isEditing = !!task
  const { createTask, updateTask } = useTaskStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: task?.description || '',
      priority: (task?.priority as TaskPriority) || 'medium',
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true)
    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          description: data.description,
          priority: data.priority,
        })
      } else {
        await createTask({
          description: data.description,
          priority: data.priority,
        })
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="What needs to be done?"
          className="glass-input w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Priority
        </label>
        <div className="flex gap-2">
          {(['high', 'medium', 'low'] as const).map((priority) => (
            <label
              key={priority}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors glass-button"
            >
              <input
                type="radio"
                value={priority}
                {...register('priority')}
                className="sr-only"
              />
              <span
                className={`w-3 h-3 rounded-full ${
                  priority === 'high'
                    ? 'bg-red-500'
                    : priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              />
              <span className="text-sm capitalize text-gray-200">{priority}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 glass-button"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {isEditing ? 'Saving...' : 'Adding...'}
            </span>
          ) : (
            isEditing ? 'Save Changes' : 'Add Task'
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} className="glass-button">
          Cancel
        </Button>
      </div>
    </form>
  )
}

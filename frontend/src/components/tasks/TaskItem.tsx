'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Badge } from '@/components/ui'
import type { Task } from '@/types'
import { Check, Trash2, Edit2 } from 'lucide-react'

interface TaskItemProps {
  task: Task
  onEdit?: (task: Task) => void
  onToggle?: (task: Task) => void
  onDelete?: (taskId: string) => void
  getPriorityVariant?: (priority: string) => 'high' | 'medium' | 'low'
}

export function TaskItem({
  task,
  onEdit,
  onToggle,
  onDelete,
  getPriorityVariant,
}: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = () => {
    onToggle?.(task)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDelete?.(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultPriorityVariant = {
    high: 'high' as const,
    medium: 'medium' as const,
    low: 'low' as const,
  }

  const priorityFn = getPriorityVariant || ((p: string) => defaultPriorityVariant[p as keyof typeof defaultPriorityVariant] || 'medium')
  const priorityBadgeVariant = priorityFn(task.priority)

  return (
    <div
      className={clsx(
        'flex items-center gap-4 p-4 rounded-xl border transition-all glass-card',
        task.is_completed
          ? 'bg-gray-800/30 border-gray-700'
          : 'bg-gray-800/20 border-gray-600 hover:border-blue-500 hover:shadow-lg'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all',
          task.is_completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-400 hover:border-blue-500'
        )}
      >
        {task.is_completed && <Check className="w-4 h-4 mx-auto" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'text-base truncate transition-all',
            task.is_completed
              ? 'line-through text-gray-400'
              : 'text-gray-100'
          )}
        >
          {task.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={priorityBadgeVariant} size="sm">
            {task.priority}
          </Badge>
          <span className="text-xs text-gray-400">
            {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-700/50 transition-colors glass-button"
            disabled={task.is_completed}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700/50 transition-colors glass-button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

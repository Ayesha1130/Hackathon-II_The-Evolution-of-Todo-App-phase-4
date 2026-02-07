import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'high' | 'medium' | 'low'
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-700 text-gray-200 glass',
      success: 'bg-green-600/30 text-green-300 glass',
      warning: 'bg-yellow-600/30 text-yellow-300 glass',
      danger: 'bg-red-600/30 text-red-300 glass',
      high: 'bg-red-600/30 text-red-300 glass',
      medium: 'bg-yellow-600/30 text-yellow-300 glass',
      low: 'bg-green-600/30 text-green-300 glass',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    }

    return (
      <span
        ref={ref}
        className={twMerge(
          'inline-flex items-center font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

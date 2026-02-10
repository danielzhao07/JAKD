import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  error?: boolean
  rightElement?: React.ReactNode
}

const shakeAnimation = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
  idle: { x: 0 },
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, icon: Icon, error, rightElement, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasValue = !!props.value && String(props.value).length > 0
    const isFloating = focused || hasValue

    return (
      <motion.div
        className="relative"
        variants={shakeAnimation}
        animate={error ? 'shake' : 'idle'}
      >
        {/* Outer glow when focused */}
        {focused && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: '0 0 15px rgba(0,255,255,0.12), inset 0 0 15px rgba(0,255,255,0.05)',
            }}
          />
        )}

        <div className="relative">
          {/* Icon */}
          {Icon && (
            <Icon
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                focused ? 'text-cyan-400' : error ? 'text-red-400' : 'text-gray-500'
              }`}
            />
          )}

          {/* Input */}
          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            className={`
              w-full bg-dark-900/80 border text-sm text-white
              ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'}
              pt-5 pb-2
              focus:outline-none transition-all duration-300
              ${error
                ? 'border-red-500/50 focus:border-red-400'
                : focused
                  ? 'border-cyan-500/60 shadow-[0_0_0_1px_rgba(0,255,255,0.15)]'
                  : 'border-dark-700 hover:border-dark-600'
              }
              ${className}
            `}
            placeholder=""
          />

          {/* Floating label */}
          <label
            className={`
              absolute left-0 transition-all duration-300 pointer-events-none
              ${Icon ? 'ml-10' : 'ml-4'}
              ${isFloating
                ? `top-1.5 text-[10px] tracking-wider uppercase ${
                    focused ? 'text-cyan-400' : error ? 'text-red-400' : 'text-gray-500'
                  }`
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
              }
            `}
          >
            {label}
          </label>

          {/* Right element (e.g., eye toggle) */}
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              {rightElement}
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'

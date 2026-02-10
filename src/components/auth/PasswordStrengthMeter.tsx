import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface PasswordStrengthMeterProps {
  password: string
}

function getStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' }

  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'WEAK' }
  if (score === 2) return { score: 2, label: 'FAIR' }
  if (score === 3) return { score: 3, label: 'GOOD' }
  if (score >= 4) return { score: 4, label: 'STRONG' }
  return { score: 0, label: '' }
}

const strengthColors = [
  'transparent',
  'rgba(239,68,68,0.8)',   // red
  'rgba(245,158,11,0.8)',  // amber
  'rgba(0,200,255,0.6)',   // cyan-ish
  'rgba(0,255,255,0.9)',   // full cyan
]

const strengthGlows = [
  'none',
  '0 0 6px rgba(239,68,68,0.3)',
  '0 0 8px rgba(245,158,11,0.3)',
  '0 0 10px rgba(0,200,255,0.3)',
  '0 0 15px rgba(0,255,255,0.5)',
]

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = useMemo(() => getStrength(password), [password])

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      {/* Bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 bg-dark-700 overflow-hidden">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{
                width: i <= score ? '100%' : '0%',
                backgroundColor: i <= score ? strengthColors[score] : 'transparent',
                boxShadow: i <= score ? strengthGlows[score] : 'none',
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      <motion.p
        className="text-[10px] font-mono tracking-wider text-right"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          color: strengthColors[score],
        }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.p>
    </div>
  )
}

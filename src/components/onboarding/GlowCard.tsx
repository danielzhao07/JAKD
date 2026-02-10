import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlowCardProps {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function GlowCard({
  children,
  selected = false,
  onClick,
  className = '',
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative cursor-pointer overflow-hidden
        transition-all duration-300
        ${selected
          ? 'border-cyan-400 bg-cyan-500/10'
          : 'border-dark-700 bg-dark-900/60 hover:border-cyan-500/40'
        }
        border
        ${className}
      `}
    >
      {/* Shimmer pulse on selected — sweeps left to right repeatedly */}
      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Edge glow that pulses */}
          <motion.div
            className="absolute inset-0"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,255,255,0.15), 0 0 15px rgba(0,255,255,0.1)',
            }}
            animate={{
              boxShadow: [
                'inset 0 0 15px rgba(0,255,255,0.1), 0 0 10px rgba(0,255,255,0.05)',
                'inset 0 0 25px rgba(0,255,255,0.2), 0 0 20px rgba(0,255,255,0.15)',
                'inset 0 0 15px rgba(0,255,255,0.1), 0 0 10px rgba(0,255,255,0.05)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Horizontal shimmer sweep */}
          <motion.div
            className="absolute inset-y-0 w-1/3"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.08), transparent)',
            }}
            animate={{ left: ['-33%', '133%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
        </motion.div>
      )}

      {/* Mouse-following spotlight */}
      {hovered && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: mousePos.x - 100,
            top: mousePos.y - 100,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Selected check indicator */}
      {selected && (
        <motion.div
          className="absolute top-3 right-3 w-6 h-6 bg-cyan-400 flex items-center justify-center z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="#050505" strokeWidth="2" strokeLinecap="square" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
}: SplitTextProps) {
  const words = text.split(' ')
  // Use word-level animation on mobile for performance
  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])

  if (isMobile) {
    return (
      <span className={className} aria-label={text}>
        {words.map((word, wi) => (
          <motion.span
            key={wi}
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: delay + wi * 0.06,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
          >
            {word}{wi < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </span>
    )
  }

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-pre">
          {word.split('').map((char, ci) => {
            const index = words.slice(0, wi).join(' ').length + (wi > 0 ? 1 : 0) + ci
            return (
              <motion.span
                key={`${wi}-${ci}`}
                className="inline-block"
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.4,
                  delay: delay + index * staggerDelay,
                  ease: [0.25, 0.46, 0.45, 0.94] as const,
                }}
              >
                {char}
              </motion.span>
            )
          })}
          {wi < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  )
}

import { motion } from 'framer-motion'

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

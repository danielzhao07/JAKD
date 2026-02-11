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

  // Check if mobile - but be conservative to avoid SSR issues
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // On mobile, use a simpler, faster animation
  if (isMobile) {
    return (
      <span className={className}>
        {words.map((word, wi) => (
          <motion.span
            key={wi}
            className="inline-block mr-[0.25em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.2,
              delay: delay + wi * 0.03,
            }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    )
  }

  // Desktop: character-by-character animation
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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

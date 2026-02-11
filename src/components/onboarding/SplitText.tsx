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

  // Use simple word-by-word animation for all devices
  return (
    <span className={className}>
      {words.map((word, wi) => (
        <motion.span
          key={wi}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3,
            delay: delay + wi * staggerDelay,
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

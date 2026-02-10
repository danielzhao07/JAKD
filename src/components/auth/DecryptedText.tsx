import { useState, useEffect, useRef, useCallback } from 'react'

interface DecryptedTextProps {
  text: string
  className?: string
  speed?: number
  revealDelay?: number
  characters?: string
}

export function DecryptedText({
  text,
  className = '',
  speed = 40,
  revealDelay = 300,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
}: DecryptedTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [revealed, setRevealed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasStarted = useRef(false)

  const scramble = useCallback(
    (revealedCount: number) => {
      return text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i < revealedCount) return text[i]
          return characters[Math.floor(Math.random() * characters.length)]
        })
        .join('')
    },
    [text, characters]
  )

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    // Phase 1: Scramble for a bit
    setDisplayed(scramble(0))
    intervalRef.current = setInterval(() => {
      setDisplayed((prev) => {
        const currentRevealed = prev.split('').filter((c, i) => c === text[i]).length
        return scramble(currentRevealed)
      })
    }, speed)

    // Phase 2: Start revealing characters one by one
    const revealTimer = setTimeout(() => {
      let count = 0
      const revealInterval = setInterval(() => {
        count++
        setRevealed(count)
        if (count >= text.length) {
          clearInterval(revealInterval)
          if (intervalRef.current) clearInterval(intervalRef.current)
          setDisplayed(text)
        }
      }, speed * 1.5)

      return () => clearInterval(revealInterval)
    }, revealDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearTimeout(revealTimer)
    }
  }, [text, speed, revealDelay, scramble])

  // Keep scrambling unrevealed chars
  useEffect(() => {
    if (revealed >= text.length) return
    const interval = setInterval(() => {
      setDisplayed(scramble(revealed))
    }, speed)
    return () => clearInterval(interval)
  }, [revealed, text.length, scramble, speed])

  return (
    <span className={`font-mono ${className}`} aria-label={text}>
      {displayed.split('').map((char, i) => (
        <span
          key={i}
          className={
            i < revealed
              ? 'text-cyan-400 transition-colors duration-200'
              : 'text-cyan-400/40'
          }
        >
          {char}
        </span>
      ))}
    </span>
  )
}

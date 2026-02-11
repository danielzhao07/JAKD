import { useEffect, useRef, useCallback } from 'react'

interface GridBackgroundProps {
  className?: string
}

export function GridBackground({ className = '' }: GridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef<number>(0)
  const sizeRef = useRef({ w: 0, h: 0 })
  const isActiveRef = useRef(false)
  const isMobileRef = useRef(false)
  const staticDrawnRef = useRef(false)

  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    if (sizeRef.current.w !== w || sizeRef.current.h !== h) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      sizeRef.current = { w, h }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const spacing = isMobileRef.current ? 60 : 40

    for (let x = 0; x <= w; x += spacing) {
      for (let y = 0; y <= h; y += spacing) {
        ctx.beginPath()
        ctx.arc(x, y, 0.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 255, 255, 0.06)'
        ctx.fill()
      }
    }

    staticDrawnRef.current = true
  }, [])

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = sizeRef.current.w
    const h = sizeRef.current.h

    if (w === 0 || h === 0) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const isMobile = isMobileRef.current
    const spacing = isMobile ? 60 : 40
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const radius = isMobile ? 120 : 200

    for (let x = 0; x <= w; x += spacing) {
      for (let y = 0; y <= h; y += spacing) {
        const dx = x - mx
        const dy = y - my
        const distSq = dx * dx + dy * dy
        const radiusSq = radius * radius

        if (distSq > radiusSq) {
          ctx.beginPath()
          ctx.arc(x, y, 0.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 255, 255, 0.06)'
          ctx.fill()
          continue
        }

        const dist = Math.sqrt(distSq)
        const influence = 1 - dist / radius

        const dotSize = 0.5 + influence * 2
        const alpha = 0.08 + influence * 0.5
        ctx.beginPath()
        ctx.arc(x, y, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`
        ctx.fill()

        if (influence > 0.1) {
          if (x + spacing <= w) {
            const ndx = (x + spacing) - mx
            const nDistSq = ndx * ndx + dy * dy
            if (nDistSq < radiusSq) {
              const nInfluence = 1 - Math.sqrt(nDistSq) / radius
              const lineAlpha = Math.min(influence, nInfluence) * 0.4
              if (lineAlpha > 0.02) {
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(x + spacing, y)
                ctx.strokeStyle = `rgba(0, 255, 255, ${lineAlpha})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          }
          if (y + spacing <= h) {
            const ndy = (y + spacing) - my
            const nDistSq = dx * dx + ndy * ndy
            if (nDistSq < radiusSq) {
              const nInfluence = 1 - Math.sqrt(nDistSq) / radius
              const lineAlpha = Math.min(influence, nInfluence) * 0.4
              if (lineAlpha > 0.02) {
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + spacing)
                ctx.strokeStyle = `rgba(0, 255, 255, ${lineAlpha})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          }
        }
      }
    }

    // Radial glow around mouse
    if (mx > 0 && my > 0) {
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius)
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.06)')
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }

    if (isActiveRef.current) {
      animFrameRef.current = requestAnimationFrame(drawFrame)
    }
  }, [])

  // Stop animation after inactivity
  const inactivityTimeout = useRef<ReturnType<typeof setTimeout>>()

  const startAnimation = useCallback(() => {
    if (!isActiveRef.current) {
      isActiveRef.current = true
      animFrameRef.current = requestAnimationFrame(drawFrame)
    }
    clearTimeout(inactivityTimeout.current)
    inactivityTimeout.current = setTimeout(() => {
      isActiveRef.current = false
      // Draw one last static frame
      drawStatic()
    }, 300)
  }, [drawFrame, drawStatic])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    isMobileRef.current = window.innerWidth < 768

    // Draw the initial static grid
    drawStatic()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      startAnimation()
    }

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      if (touch) {
        mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
        startAnimation()
      }
    }

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
      isActiveRef.current = false
      cancelAnimationFrame(animFrameRef.current)
      drawStatic()
    }

    const handleResize = () => {
      isMobileRef.current = window.innerWidth < 768
      sizeRef.current = { w: 0, h: 0 }
      staticDrawnRef.current = false
      drawStatic()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchend', handleLeave)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('mouseleave', handleLeave)
      canvas.removeEventListener('touchend', handleLeave)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrameRef.current)
      clearTimeout(inactivityTimeout.current)
    }
  }, [drawStatic, drawFrame, startAnimation])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ pointerEvents: 'all' }}
    />
  )
}

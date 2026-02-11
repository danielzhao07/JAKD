import { useEffect, useRef, useCallback } from 'react'

interface GridBackgroundProps {
  className?: string
}

export function GridBackground({ className = '' }: GridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef<number>(0)
  const sizeRef = useRef({ w: 0, h: 0 })
  const lastFrameTime = useRef(0)

  const draw = useCallback((time: number) => {
    // Throttle to ~30fps for performance
    if (time - lastFrameTime.current < 32) {
      animFrameRef.current = requestAnimationFrame(draw)
      return
    }
    lastFrameTime.current = time

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap DPR at 2
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    // Only resize canvas when dimensions change
    if (sizeRef.current.w !== w || sizeRef.current.h !== h) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      sizeRef.current = { w, h }
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    ctx.clearRect(0, 0, w, h)

    // Larger spacing on mobile for fewer calculations
    const isMobile = w < 768
    const spacing = isMobile ? 60 : 40
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const radius = isMobile ? 150 : 200

    // Draw grid dots — only draw near mouse on mobile
    for (let x = 0; x <= w; x += spacing) {
      for (let y = 0; y <= h; y += spacing) {
        const dx = x - mx
        const dy = y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const influence = Math.max(0, 1 - dist / radius)

        // On mobile, skip dots far from mouse for perf
        if (isMobile && influence === 0) {
          // Still draw a very faint static dot
          ctx.beginPath()
          ctx.arc(x, y, 0.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 255, 255, 0.06)'
          ctx.fill()
          continue
        }

        const dotSize = 0.5 + influence * 2
        const alpha = 0.08 + influence * 0.5
        ctx.beginPath()
        ctx.arc(x, y, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`
        ctx.fill()

        // Connecting lines near mouse
        if (influence > 0.1) {
          if (x + spacing <= w) {
            const ndx = (x + spacing) - mx
            const ndy = y - my
            const nDist = Math.sqrt(ndx * ndx + ndy * ndy)
            const nInfluence = Math.max(0, 1 - nDist / radius)
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
          if (y + spacing <= h) {
            const ndx = x - mx
            const ndy = (y + spacing) - my
            const nDist = Math.sqrt(ndx * ndx + ndy * ndy)
            const nInfluence = Math.max(0, 1 - nDist / radius)
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

    // Radial glow around mouse
    if (mx > 0 && my > 0) {
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius)
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.06)')
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      if (touch) {
        mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
      }
    }

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchend', handleLeave)
    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('mouseleave', handleLeave)
      canvas.removeEventListener('touchend', handleLeave)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ pointerEvents: 'all' }}
    />
  )
}

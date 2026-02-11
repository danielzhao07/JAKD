import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface MuscleDistributionData {
  name: string
  value: number
}

interface MuscleDistributionChartProps {
  data: MuscleDistributionData[]
  className?: string
}

export function MuscleDistributionChart({ data, className }: MuscleDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const n = data.length
    const width = 620
    const height = 500
    const centerX = width / 2
    const centerY = height / 2
    const levels = 5

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')

    // Create gradient for the data area
    const defs = svg.append('defs')
    
    const gradient = defs.append('radialGradient')
      .attr('id', 'muscle-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.8)
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0891b2')
      .attr('stop-opacity', 0.2)

    // Add glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Draw polygon grid with darker styling
    for (let level = 0; level <= levels; level++) {
      const radius = 30 + level * 36
      const points: [number, number][] = []
      
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI / n) * i - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push([x, y])
      }
      
      svg.append('polygon')
        .attr('points', points.map(p => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', level === levels ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.15)')
        .attr('stroke-width', level === levels ? 2 : 1)
    }

    // Draw radial lines from center
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI / n) * i - Math.PI / 2
      const radius = 30 + levels * 36
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', 'rgba(6, 182, 212, 0.15)')
        .attr('stroke-width', 1)
    }

    // Draw data polygon with animation
    const dataPoints: [number, number][] = data.map((item, i) => {
      const angle = (2 * Math.PI / n) * i - Math.PI / 2
      const radius = 30 + (item.value / 100) * 180
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      return [x, y]
    })

    // Add filled polygon with gradient
    const polygon = svg.append('polygon')
      .attr('points', dataPoints.map(() => `${centerX},${centerY}`).join(' '))
      .attr('fill', 'url(#muscle-gradient)')
      .attr('opacity', 0)

    polygon.transition()
      .duration(1000)
      .attr('points', dataPoints.map(p => p.join(',')).join(' '))
      .attr('opacity', 1)

    // Add glowing stroke
    svg.append('polygon')
      .attr('points', dataPoints.map(() => `${centerX},${centerY}`).join(' '))
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .transition()
      .duration(1000)
      .attr('points', dataPoints.map(p => p.join(',')).join(' '))

    // Add orange/yellow accent line
    const accentPoints: [number, number][] = data.map((item, i) => {
      const angle = (2 * Math.PI / n) * i - Math.PI / 2
      const radius = 30 + (item.value / 100) * 180 * 0.85 // 85% of main value
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      return [x, y]
    })

    svg.append('polygon')
      .attr('points', accentPoints.map(() => `${centerX},${centerY}`).join(' '))
      .attr('fill', 'none')
      .attr('stroke', '#fb923c')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay(200)
      .attr('points', accentPoints.map(p => p.join(',')).join(' '))
      .attr('opacity', 0.7)

    // Draw labels with better styling
    data.forEach((item, i) => {
      const angle = (2 * Math.PI / n) * i - Math.PI / 2
      const radius = 220
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Smart text-anchor: labels on the left side anchor end, right side anchor start
      const angleDeg = (angle * 180) / Math.PI
      const isLeft = angleDeg > 90 || angleDeg < -90
      const isTop = Math.abs(angleDeg + 90) < 20 // near top
      const isBottom = Math.abs(angleDeg - 90) < 20 // near bottom
      const anchor = isTop || isBottom ? 'middle' : isLeft ? 'end' : 'start'

      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', anchor)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '12px')
        .attr('font-weight', '400')
        .attr('font-family', '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace')
        .attr('letter-spacing', '0.05em')
        .attr('opacity', 0)
        .text(item.name.toUpperCase())
        .transition()
        .duration(500)
        .delay(800)
        .attr('opacity', 1)
    })

    // Add data points at vertices with hover tooltips
    const tooltip = d3.select(svgRef.current.parentElement!)
      .append('div')
      .attr('class', 'absolute pointer-events-none px-2 py-1 text-[11px] text-white bg-gray-900/90 border border-cyan-500/20 backdrop-blur-sm opacity-0 transition-opacity duration-200 z-10')
      .style('transform', 'translate(-50%, -120%)')

    dataPoints.forEach((point, i) => {
      svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 0)
        .attr('fill', '#06b6d4')
        .attr('filter', 'url(#glow)')
        .attr('cursor', 'pointer')
        .on('mouseenter', function () {
          d3.select(this).attr('r', 8)
          const rect = svgRef.current!.getBoundingClientRect()
          const svgWidth = rect.width
          const svgHeight = rect.height
          const scaleX = svgWidth / width
          const scaleY = svgHeight / height
          tooltip
            .html(`<span style="color:#06b6d4;font-weight:600">${data[i].name}</span> · ${Math.round(data[i].value)}%`)
            .style('left', `${point[0] * scaleX}px`)
            .style('top', `${point[1] * scaleY}px`)
            .style('opacity', '1')
        })
        .on('mouseleave', function () {
          d3.select(this).attr('r', 5)
          tooltip.style('opacity', '0')
        })
        .transition()
        .duration(500)
        .delay(1000 + i * 100)
        .attr('cx', point[0])
        .attr('cy', point[1])
        .attr('r', 5)
    })
  }, [data])

  return (
    <div className={`flex justify-center relative ${className || ''}`}>
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}

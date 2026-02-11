import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface MuscleHitData {
  name: string
  sets: number
}

interface MuscleHitBarChartProps {
  data: MuscleHitData[]
}

export function MuscleHitBarChart({ data }: MuscleHitBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const sorted = [...data].sort((a, b) => b.sets - a.sets)
    const barHeight = 22
    const gap = 6
    const margin = { top: 22, right: 36, bottom: 8, left: 80 }
    const width = 400
    const height = margin.top + margin.bottom + sorted.length * (barHeight + gap) - gap

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const defs = svg.append('defs')

    const gradient = defs.append('linearGradient')
      .attr('id', 'muscle-bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.7)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#22d3ee')
      .attr('stop-opacity', 0.4)

    const filter = defs.append('filter')
      .attr('id', 'bar-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%')

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    const maxSets = d3.max(sorted, d => d.sets) || 1
    const xScale = d3.scaleLinear()
      .domain([0, maxSets])
      .range([0, width - margin.left - margin.right])

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // "SETS" column header
    g.append('text')
      .attr('x', width - margin.left - margin.right + 8)
      .attr('y', -10)
      .attr('text-anchor', 'start')
      .attr('fill', '#6b7280')
      .attr('font-size', '8px')
      .attr('font-weight', '600')
      .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .attr('letter-spacing', '0.08em')
      .text('SETS')

    // Tooltip div
    const tooltip = d3.select(svgRef.current.parentElement!)
      .append('div')
      .attr('class', 'absolute pointer-events-none px-2 py-1 text-[11px] text-white bg-gray-900/90 border border-cyan-500/20 backdrop-blur-sm opacity-0 transition-opacity duration-200 z-10')
      .style('white-space', 'nowrap')

    // Bars
    sorted.forEach((d, i) => {
      const y = i * (barHeight + gap)

      // Background track
      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', width - margin.left - margin.right)
        .attr('height', barHeight)
        .attr('rx', 2)
        .attr('fill', 'rgba(30, 41, 59, 0.5)')

      // Animated bar
      const bar = g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('rx', 2)
        .attr('fill', 'url(#muscle-bar-gradient)')
        .attr('filter', 'url(#bar-glow)')
        .attr('cursor', 'pointer')

      bar.transition()
        .duration(600)
        .delay(i * 60)
        .ease(d3.easeCubicOut)
        .attr('width', xScale(d.sets))

      // Hover on bar
      bar.on('mouseenter', function (event: MouseEvent) {
        d3.select(this).attr('opacity', 0.8)
        const rect = svgRef.current!.getBoundingClientRect()
        tooltip
          .html(`<span style="color:#06b6d4;font-weight:600">${d.name}</span> · ${d.sets} set${d.sets !== 1 ? 's' : ''} this week`)
          .style('left', `${event.clientX - rect.left}px`)
          .style('top', `${event.clientY - rect.top - 30}px`)
          .style('opacity', '1')
      })
      .on('mousemove', function (event: MouseEvent) {
        const rect = svgRef.current!.getBoundingClientRect()
        tooltip
          .style('left', `${event.clientX - rect.left}px`)
          .style('top', `${event.clientY - rect.top - 30}px`)
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1)
        tooltip.style('opacity', '0')
      })

      // Label (muscle name) — uppercase, different font
      g.append('text')
        .attr('x', -8)
        .attr('y', y + barHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#94a3b8')
        .attr('font-size', '9px')
        .attr('font-family', '"Inter", "Helvetica Neue", Arial, sans-serif')
        .attr('font-weight', '500')
        .attr('letter-spacing', '0.06em')
        .attr('opacity', 0)
        .text(d.name.toUpperCase())
        .transition()
        .duration(400)
        .delay(i * 60)
        .attr('opacity', 1)

      // Set count
      g.append('text')
        .attr('x', width - margin.left - margin.right + 8)
        .attr('y', y + barHeight / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#06b6d4')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
        .attr('opacity', 0)
        .text(d.sets)
        .transition()
        .duration(400)
        .delay(i * 60 + 300)
        .attr('opacity', 1)
    })
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-gray-600 text-xs">
        No muscle data yet
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <svg ref={svgRef} />
    </div>
  )
}

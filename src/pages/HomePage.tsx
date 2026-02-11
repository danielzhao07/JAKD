import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Play,
  Camera,
  PenLine,
  Dumbbell,
  Flame,
  ChevronRight,
  Calendar,
  BarChart3,
  Zap,
  Library,
  TrendingUp,
  Timer,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { useHistoryStore } from '@/store/historyStore'
import { useRoutineStore } from '@/store/routineStore'
import { useExerciseStore } from '@/store/exerciseStore'
import { useWorkoutSessionStore } from '@/store/workoutSessionStore'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { ROUTES, EXERCISES_SEED } from '@/utils/constants'
import type { Exercise } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(user: { user_metadata?: { full_name?: string; name?: string }; email?: string } | null): string {
  if (!user) return 'Athlete'
  const full = user.user_metadata?.full_name || user.user_metadata?.name || ''
  if (full) return full.split(' ')[0]
  if (user.email) return user.email.split('@')[0]
  return 'Athlete'
}

function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remainder = mins % 60
  return remainder > 0 ? `${hrs}h ${remainder}m` : `${hrs}h`
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Animations ─────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(251,146,60,0)',
      '0 0 12px rgba(251,146,60,0.3)',
      '0 0 0px rgba(251,146,60,0)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

// ScrollSection: fade-up on scroll into view (once only to prevent bouncing)
function ScrollSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Component ──────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { startWorkout } = useWorkoutStore()
  const { workouts, loadWorkouts } = useHistoryStore()
  const { routines, fetchRoutines } = useRoutineStore()
  const { exercises, fetchExercises } = useExerciseStore()

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  // Load data on mount
  useEffect(() => {
    loadWorkouts()
    fetchExercises()
    if (user) fetchRoutines(user.id)
  }, [user])

  // ─── Derived stats ──────────────────────────────────────────

  const stats = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeek = workouts.filter((w) => new Date(w.createdAt) >= startOfWeek)
    const totalRepsThisWeek = thisWeek.reduce((sum, w) => sum + w.repCount, 0)
    const totalTimeThisWeek = thisWeek.reduce((sum, w) => sum + w.durationMs, 0)

    return {
      workoutsThisWeek: thisWeek.length,
      totalReps: totalRepsThisWeek,
      totalTime: totalTimeThisWeek,
    }
  }, [workouts])

  // ─── Streak ─────────────────────────────────────────────────

  const streak = useMemo(() => {
    if (workouts.length === 0) return 0

    const workoutDays = new Set(
      workouts.map((w) => {
        const d = new Date(w.createdAt)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      })
    )

    let count = 0
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    if (!workoutDays.has(todayKey)) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`
      if (!workoutDays.has(yesterdayKey)) return 0
    }

    const checkDate = new Date(today)
    if (!workoutDays.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    for (let i = 0; i < 365; i++) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
      if (workoutDays.has(key)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return count
  }, [workouts])

  // ─── Full month heatmap ───────────────────────────────────

  const heatmapData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days: { date: Date; count: number; dayNum: number }[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      date.setHours(0, 0, 0, 0)
      const count = workouts.filter((w) => {
        const wd = new Date(w.createdAt)
        return (
          wd.getFullYear() === date.getFullYear() &&
          wd.getMonth() === date.getMonth() &&
          wd.getDate() === date.getDate()
        )
      }).length
      days.push({ date, count, dayNum: d })
    }
    return days
  }, [workouts])

  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOffset = heatmapData.length > 0 ? heatmapData[0].date.getDay() : 0

  // ─── Recent workouts ───────────────────────────────────────

  const recentWorkouts = useMemo(() => {
    return workouts
      .slice(0, 6)
      .map((w) => {
        const exercise = exercises.find((e) => e.id === w.exerciseId)
          || EXERCISES_SEED.find((e) => e.id === w.exerciseId)
        return { ...w, exerciseName: exercise?.name || 'Unknown Exercise' }
      })
  }, [workouts, exercises])

  // ─── Exercise selection handlers ────────────────────────────

  const handleQuickExerciseStart = (exercise: Exercise) => {
    const { startEmptyWorkout, addExercise } = useWorkoutSessionStore.getState()
    startEmptyWorkout()
    addExercise(exercise)
    navigate(ROUTES.WORKOUT_ACTIVE)
  }

  const handleStartCamera = () => {
    if (!selectedExercise) return
    startWorkout(selectedExercise, true)
    setSelectedExercise(null)
    navigate(ROUTES.WORKOUT)
  }

  const handleStartManual = () => {
    if (!selectedExercise) return
    startWorkout(selectedExercise, false)
    setSelectedExercise(null)
    navigate(ROUTES.MANUAL_ENTRY)
  }

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="pb-8 space-y-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <ScrollSection className="text-center pt-2 pb-2">
        <motion.img
          src="/jakd-logo.png"
          alt="JAKD"
          className="h-20 md:h-24 mx-auto mb-3"
          style={{ filter: 'invert(1) brightness(2)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        />
        <motion.h1
          className="text-xl font-semibold text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {getGreeting()}, {getFirstName(user)}
        </motion.h1>
        <motion.p
          className="text-gray-500 text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Let's get after it.
        </motion.p>
      </ScrollSection>

      {/* ─── Quick Actions ──────────────────────────────────── */}
      <ScrollSection className="grid grid-cols-2 gap-3">
        {/* Start Empty Workout */}
        <motion.button
          onClick={() => navigate(ROUTES.WORKOUT)}
          className="group bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/30 p-4 text-left transition-all duration-300 hover:border-cyan-400/50 hover:from-cyan-500/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30 mb-3 transition-colors group-hover:bg-cyan-500/30">
            <Play size={20} className="text-cyan-400" />
          </div>
          <p className="text-white font-medium text-sm">Start Workout</p>
        </motion.button>

        {/* Streak with pulse */}
        <motion.div
          className="bg-dark-800 border border-dark-700 p-4"
          animate={streak > 0 ? pulseGlow.animate : {}}
        >
          <div className="w-10 h-10 flex items-center justify-center bg-orange-500/15 border border-orange-500/30 mb-3">
            <motion.div
              animate={streak > 0 ? { rotate: [0, -10, 10, -5, 0] } : {}}
              transition={{ duration: 0.6, delay: 0.8, ease: 'easeInOut' }}
            >
              <Flame size={20} className="text-orange-400" />
            </motion.div>
          </div>
          <p className="text-white font-medium text-sm">
            {streak} Day{streak !== 1 ? 's' : ''}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Current streak</p>
        </motion.div>
      </ScrollSection>

      {/* ─── Calendar + Weekly Stats (split layout) ────────── */}
      <ScrollSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Activity Heatmap — full month */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                {currentMonthLabel}
              </h2>
              <Calendar size={14} className="text-gray-600" />
            </div>
            <div className="bg-dark-800 border border-dark-700 p-3">
              <div className="grid grid-cols-7 gap-1">
                {/* Day labels */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-[8px] text-gray-600 text-center font-mono">
                    {day}
                  </div>
                ))}
                {/* Pad cells for first day offset */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {/* Heatmap cells */}
                {heatmapData.map((day, i) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const hasWorkout = day.count > 0
                  const bg = hasWorkout ? 'bg-cyan-500/40' : 'bg-dark-700/60'

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.01 }}
                      className={`aspect-square ${bg} transition-colors relative ${
                        isToday ? 'ring-1 ring-cyan-400/60' : ''
                      }`}
                      title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                    >
                      <span className={`absolute inset-0 flex items-center justify-center text-[7px] font-mono ${hasWorkout ? 'text-cyan-200/70' : 'text-gray-500/60'}`}>
                        {day.dayNum}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-1.5 mt-2">
                <div className="w-2.5 h-2.5 bg-dark-700/60" />
                <span className="text-[8px] text-gray-600">No workout</span>
                <div className="w-2.5 h-2.5 bg-cyan-500/40 ml-1" />
                <span className="text-[8px] text-gray-600">Workout</span>
              </div>
            </div>
          </div>

          {/* Weekly Stats — right half */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">This Week</h2>
              <BarChart3 size={14} className="text-gray-600" />
            </div>
            <div className="bg-dark-800 border border-dark-700 p-3 space-y-2">
              {/* Workouts */}
              <motion.div
                className="flex items-center gap-3 p-2.5 bg-dark-700/40 border border-dark-600/50"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-9 h-9 flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 flex-shrink-0">
                  <TrendingUp size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{stats.workoutsThisWeek}</p>
                  <p className="text-gray-500 text-[11px]">Workouts</p>
                </div>
              </motion.div>
              {/* Total Reps */}
              <motion.div
                className="flex items-center gap-3 p-2.5 bg-dark-700/40 border border-dark-600/50"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-9 h-9 flex items-center justify-center bg-purple-500/15 border border-purple-500/30 flex-shrink-0">
                  <Dumbbell size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{stats.totalReps}</p>
                  <p className="text-gray-500 text-[11px]">Total Reps</p>
                </div>
              </motion.div>
              {/* Active Time */}
              <motion.div
                className="flex items-center gap-3 p-2.5 bg-dark-700/40 border border-dark-600/50"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-9 h-9 flex items-center justify-center bg-green-500/15 border border-green-500/30 flex-shrink-0">
                  <Timer size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{formatDuration(stats.totalTime)}</p>
                  <p className="text-gray-500 text-[11px]">Active Time</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* ─── My Routines ────────────────────────────────────── */}
      {routines.length > 0 && (
        <ScrollSection>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">My Routines</h2>
            <button
              onClick={() => navigate(ROUTES.WORKOUT)}
              className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <motion.div
            className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {routines.slice(0, 5).map((routine) => (
              <motion.button
                key={routine.id}
                variants={staggerItem}
                onClick={() => navigate(ROUTES.WORKOUT_ACTIVE, { state: { routine } })}
                className="flex-shrink-0 w-44 bg-dark-800 border border-dark-700 p-4 text-left transition-all duration-300 hover:border-cyan-500/30 group"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell size={14} className="text-cyan-400" />
                  <span className="text-xs text-gray-500">{routine.exercises.length} exercises</span>
                </div>
                <p className="text-white text-sm font-medium truncate">{routine.name}</p>
                {routine.description && (
                  <p className="text-gray-500 text-xs mt-1 truncate">{routine.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-cyan-400/70 text-xs group-hover:text-cyan-400 transition-colors">
                  <Zap size={12} />
                  Quick Start
                </div>
              </motion.button>
            ))}
          </motion.div>
        </ScrollSection>
      )}

      {/* ─── Recent Workouts ────────────────────────────────── */}
      {recentWorkouts.length > 0 && (
        <ScrollSection>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recent Workouts</h2>
            <button
              onClick={() => navigate(ROUTES.HISTORY)}
              className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <motion.div
            className="space-y-2"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {recentWorkouts.map((workout) => (
              <motion.div
                key={workout.id}
                variants={staggerItem}
                className="bg-dark-800 border border-dark-700 p-3 flex items-center justify-between transition-colors hover:border-dark-600"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                    <Dumbbell size={16} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {workout.exerciseName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {workout.repCount} reps · {formatDuration(workout.durationMs)}
                    </p>
                  </div>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0 ml-2">
                  {formatRelativeDate(workout.createdAt)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </ScrollSection>
      )}

      {/* ─── Quick Exercise ────────────────────────────────── */}
      <ScrollSection>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Quick Exercise</h2>
          <button
            onClick={() => navigate(ROUTES.EXERCISES)}
            className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
          >
            <Library size={12} />
            <span className="ml-0.5">Browse All</span>
          </button>
        </div>
        <motion.div
          className="grid grid-cols-2 gap-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {EXERCISES_SEED.map((exercise) => (
            <motion.button
              key={exercise.id}
              variants={staggerItem}
              onClick={() => handleQuickExerciseStart(exercise)}
              className="bg-dark-800 border border-dark-700 p-3 text-left transition-all duration-300 hover:border-cyan-500/30 group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-dark-700 border border-dark-600 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-colors">
                  <Dumbbell size={14} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{exercise.name}</p>
                  <p className="text-gray-600 text-[11px] capitalize">{exercise.category}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </ScrollSection>

      {/* ─── Exercise Modal ─────────────────────────────────── */}
      <Modal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name || 'Start Workout'}
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{selectedExercise?.description}</p>
          <div className="space-y-3">
            <Button onClick={handleStartCamera} className="w-full justify-start" size="lg">
              <Camera size={20} />
              <span className="ml-3">Start with Camera</span>
            </Button>
            <p className="text-xs text-gray-500 ml-1">
              Uses your camera for automatic rep counting and form analysis
            </p>
            <Button variant="secondary" onClick={handleStartManual} className="w-full justify-start" size="lg">
              <PenLine size={20} />
              <span className="ml-3">Manual Entry</span>
            </Button>
            <p className="text-xs text-gray-500 ml-1">
              Manually log your reps without using the camera
            </p>
          </div>
        </div>
      </Modal>
\    </div>
  )
}

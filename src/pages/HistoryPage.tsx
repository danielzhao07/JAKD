import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Modal } from '@/components/shared/Modal'
import { MuscleDistributionChart } from '@/components/charts/MuscleDistributionChart'
import { MuscleHitBarChart } from '@/components/charts/MuscleHitBarChart'
import { LineChart } from '@/components/charts/LineChart'
import { useHistoryStore } from '@/store/historyStore'
import { useAuthStore } from '@/store/authStore'
import { useExerciseStore } from '@/store/exerciseStore'
import { VideoStorageRepository } from '@/repositories/VideoStorageRepository'
import { WorkoutSessionRepository, type WorkoutSessionModel } from '@/repositories/WorkoutSessionRepository'
import { formatDuration, formatDate, formatTime } from '@/utils/helpers'
import { EXERCISES_SEED } from '@/utils/constants'
import { useCountUp } from '@/hooks/useCountUp'
import {
  Calendar, Clock, Target, Trash2, Video, Play, TrendingUp, ChevronDown,
  ChevronRight, BarChart3, Dumbbell, Timer, CheckCircle2, Flame,
  Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip
} from 'recharts'

// ─── Animation variants ─────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

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

// ─── Glassmorphism stat card ─────────────────────────────────────
function StatCard({ icon: Icon, label, value, suffix, color = 'cyan' }: {
  icon: React.ElementType; label: string; value: number; suffix?: string; color?: string
}) {
  const animatedValue = useCountUp(value)
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/20',
    green: 'text-green-400 bg-green-500/15 border-green-500/20',
    orange: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
  }
  const iconColor = colorMap[color] || colorMap.cyan
  const textColor = color === 'cyan' ? 'text-cyan-400' : color === 'green' ? 'text-green-400' : color === 'orange' ? 'text-orange-400' : 'text-purple-400'

  return (
    <motion.div
      className="bg-dark-800/60 backdrop-blur-md border border-cyan-500/10 p-4 relative overflow-hidden group hover:border-cyan-500/25 transition-colors"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/5 to-transparent" />
      <div className={`w-9 h-9 flex items-center justify-center ${iconColor} border mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        {animatedValue.toLocaleString()}
        {suffix && <span className={`text-sm ml-1 ${textColor}`}>{suffix}</span>}
      </p>
    </motion.div>
  )
}

// ─── Workout Session Card (animated) ─────────────────────────────
function WorkoutSessionCard({ session, onDelete }: {
  session: WorkoutSessionModel; onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const formatSessionDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatSessionTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <motion.div
      variants={staggerItem}
      layout
      className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 overflow-hidden hover:border-cyan-500/20 transition-colors"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
              <Dumbbell size={18} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{session.routineName}</h3>
              <p className="text-gray-500 text-xs">
                {formatSessionDate(session.createdAt)} at {formatSessionTime(session.createdAt)}
              </p>
            </div>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-gray-500" />
          </motion.div>
        </div>

        <div className="flex gap-4 text-sm ml-[52px]">
          <div className="flex items-center gap-1.5">
            <Timer size={14} className="text-cyan-400" />
            <span className="text-cyan-400 font-medium text-xs">{formatSessionDuration(session.durationSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-gray-400" />
            <span className="text-white text-xs">{Math.round(session.totalVolume).toLocaleString()} lbs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-white text-xs">{session.completedSets}/{session.totalSets} sets</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="overflow-hidden"
          >
            <div className="border-t border-dark-700/60 p-4 space-y-4">
              {session.exercisesData.map((exercise, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                      <span className="text-cyan-400 text-xs font-bold">{exercise.exerciseName.charAt(0)}</span>
                    </div>
                    <span className="text-cyan-400 font-medium text-sm">{exercise.exerciseName}</span>
                  </div>
                  <div className="ml-9 space-y-1">
                    {exercise.sets.filter(s => s.completed).map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="text-gray-500 w-10">Set {set.setNumber}</span>
                        {set.weight && <span className="text-white">{set.weight} lbs</span>}
                        <span className="text-gray-300">{set.reps} reps</span>
                      </div>
                    ))}
                  </div>
                  {exercise.notes && (
                    <p className="ml-9 text-gray-500 text-xs italic">{exercise.notes}</p>
                  )}
                </motion.div>
              ))}

              {session.description && (
                <p className="text-gray-400 text-sm pt-2 border-t border-dark-700/40">{session.description}</p>
              )}

              {session.photoUrl && (
                <img src={session.photoUrl} alt="Workout" className="w-full h-48 object-cover" />
              )}

              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="text-red-400/60 text-xs flex items-center gap-1.5 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
                Delete Workout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────

export function HistoryPage() {
  const { user } = useAuthStore()
  const { workouts, isLoading, error, loadWorkouts, deleteWorkout } = useHistoryStore()
  const { exercises: allExercises, fetchExercises } = useExerciseStore()
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [selectedWorkoutName, setSelectedWorkoutName] = useState<string>('')
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [activeTab, setActiveTab] = useState<'charts' | 'log' | 'videos'>('charts')
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())
  const [showVideoStats, setShowVideoStats] = useState(false)
  const [videoStatsView, setVideoStatsView] = useState<'stats' | 'charts'>('stats')
  const [muscleDistributionPeriod, setMuscleDistributionPeriod] = useState<'week' | 'month' | '3months' | 'year'>('month')
  const [muscleDistributionDropdownOpen, setMuscleDistributionDropdownOpen] = useState(false)
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month')

  // Workout sessions state
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionModel[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
    fetchExercises()
  }, [loadWorkouts, fetchExercises])

  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return
      setSessionsLoading(true)
      try {
        const sessions = await WorkoutSessionRepository.getUserWorkoutSessions(user.id)
        setWorkoutSessions(sessions)
      } catch (err) {
        console.error('Failed to load workout sessions:', err)
      } finally {
        setSessionsLoading(false)
      }
    }
    loadSessions()
  }, [user])

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await WorkoutSessionRepository.deleteWorkoutSession(sessionId)
      setWorkoutSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const getExerciseName = (exerciseId: string) => {
    return EXERCISES_SEED.find((e) => e.id === exerciseId)?.name || 'Unknown Exercise'
  }

  // ─── Session stats ──────────────────────────────────────────
  const sessionStats = useMemo(() => {
    const totalSessions = workoutSessions.length
    const totalVolume = workoutSessions.reduce((sum, s) => sum + s.totalVolume, 0)
    const totalDuration = workoutSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
    const totalSets = workoutSessions.reduce((sum, s) => sum + s.completedSets, 0)

    // Advanced stats
    const heaviestLift = Math.max(
      ...workoutSessions.flatMap(s => 
        s.exercisesData.flatMap(ex => 
          ex.sets.filter(set => set.completed).map(set => {
            const weight = typeof set.weight === 'string' ? parseFloat(set.weight) || 0 : (set.weight || 0)
            return weight
          })
        )
      ),
      0
    )
    
    const workoutDensity = totalSessions > 0 && totalDuration > 0
      ? (totalSets / (totalDuration / 60)).toFixed(1) // sets per minute
      : '0'

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toDateString()
    })

    const volumeByDay = last7Days.map(dateStr => {
      const dayVolume = workoutSessions
        .filter(s => new Date(s.createdAt).toDateString() === dateStr)
        .reduce((sum, s) => sum + s.totalVolume, 0)
      const date = new Date(dateStr)
      return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), volume: Math.round(dayVolume) }
    })

    const exerciseFreq = new Map<string, number>()
    workoutSessions.forEach(s => {
      s.exercisesData.forEach(ex => {
        exerciseFreq.set(ex.exerciseName, (exerciseFreq.get(ex.exerciseName) || 0) + 1)
      })
    })
    const topExercises = Array.from(exerciseFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const categoryDist = new Map<string, number>()
    workoutSessions.forEach(s => {
      s.exercisesData.forEach(ex => {
        const category = ex.exerciseCategory || 'Other'
        categoryDist.set(category, (categoryDist.get(category) || 0) + 1)
      })
    })
    const categoryData = Array.from(categoryDist.entries()).map(([name, value]) => ({ name, value }))

    // Muscle hit sets: specific muscle groups from sessions THIS WEEK
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const thisWeekSessions = workoutSessions.filter(s => new Date(s.createdAt) >= weekStart)
    const muscleHitMap = new Map<string, number>()
    thisWeekSessions.forEach(s => {
      s.exercisesData.forEach(ex => {
        const name = ex.exerciseName.toLowerCase()
        const addMuscle = (muscle: string, sets: number) => {
          muscleHitMap.set(muscle, (muscleHitMap.get(muscle) || 0) + sets)
        }
        const completedSets = ex.sets.filter(set => set.completed).length
        if (name.includes('push-up') || name.includes('pushup') || name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('pec')) addMuscle('Chest', completedSets)
        if (name.includes('bicep') || name.includes('curl') || name.includes('hammer')) addMuscle('Biceps', completedSets)
        if (name.includes('tricep') || name.includes('dip') || name.includes('extension') || name.includes('skull') || name.includes('kickback')) addMuscle('Triceps', completedSets)
        if (name.includes('squat') || name.includes('quad') || name.includes('lunge') || name.includes('leg press') || name.includes('leg extension')) addMuscle('Quads', completedSets)
        if (name.includes('hamstring') || name.includes('deadlift') || name.includes('leg curl') || name.includes('rdl') || name.includes('hip thrust') || name.includes('glute')) addMuscle('Hamstrings', completedSets)
        if (name.includes('shoulder') || name.includes('lateral raise') || name.includes('front raise') || name.includes('rear delt') || name.includes('military') || (name.includes('press') && !name.includes('bench') && !name.includes('leg'))) addMuscle('Shoulders', completedSets)
        if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('back') || name.includes('chin')) addMuscle('Back', completedSets)
        if (name.includes('ab') || name.includes('crunch') || name.includes('plank') || name.includes('core') || name.includes('sit-up') || name.includes('situp')) addMuscle('Core', completedSets)
      })
    })
    const muscleHitData = Array.from(muscleHitMap.entries())
      .map(([name, sets]) => ({ name, sets }))
      .filter(d => d.sets > 0)
      .sort((a, b) => b.sets - a.sets)

    return { 
      totalSessions, totalVolume, totalDuration, totalSets, volumeByDay, 
      topExercises, categoryData, 
      heaviestLift, workoutDensity, muscleHitData 
    }
  }, [workoutSessions])

  // ─── Global stats (streak, calendar) ────────────────────────
  const stats = useMemo(() => {
    const totalWorkouts = workouts.length
    const totalReps = workouts.reduce((sum, w) => sum + w.repCount, 0)
    const totalDuration = workouts.reduce((sum, w) => sum + (w.durationMs || 0), 0)
    const videoWorkouts = workouts.filter(w => w.videoUrl).length
    const avgFormScore = videoWorkouts > 0
      ? workouts.filter(w => w.formScore !== null).reduce((sum, w) => sum + (w.formScore || 0), 0) / workouts.filter(w => w.formScore !== null).length
      : 0

    const workoutDates = new Set([
      ...workouts.map(w => new Date(w.createdAt).toDateString()),
      ...workoutSessions.map(s => new Date(s.createdAt).toDateString())
    ])

    let currentStreak = 0
    let restDays = 0
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const hasWorkout = workoutDates.has(checkDate.toDateString())
      if (hasWorkout) { currentStreak++; restDays = 0 }
      else { if (currentStreak === 0) restDays++; else break }
    }

    const now2 = new Date()
    const currentMonth = now2.getMonth()
    const currentYear = now2.getFullYear()

    const generateMonthCalendar = (year: number, month: number) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDayOfMonth = new Date(year, month, 1).getDay()
      const calendarDays: (null | { day: number; hasWorkout: boolean; isToday: boolean })[] = []
      for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        calendarDays.push({
          day,
          hasWorkout: workoutDates.has(date.toDateString()),
          isToday: year === now2.getFullYear() && month === now2.getMonth() && day === now2.getDate()
        })
      }
      return calendarDays
    }

    const currentMonthCalendar = generateMonthCalendar(currentYear, currentMonth)

    // Generate full year calendar (all 12 months)
    const yearCalendar = Array.from({ length: 12 }, (_, monthIdx) => ({
      month: monthIdx,
      label: new Date(currentYear, monthIdx).toLocaleDateString('en-US', { month: 'short' }),
      days: generateMonthCalendar(currentYear, monthIdx)
    }))

    return {
      totalWorkouts, totalReps, totalDuration, videoWorkouts,
      avgFormScore: Math.round(avgFormScore), workoutDays: workoutDates.size,
      currentStreak, restDays, currentMonthCalendar, currentMonth, currentYear,
      yearCalendar
    }
  }, [workouts, workoutSessions])

  // ─── Muscle distribution & period stats ─────────────────────
  const { muscleDistribution, periodStats, previousPeriodStats } = useMemo(() => {
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (muscleDistributionPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 86400000)
        previousStartDate = new Date(now.getTime() - 14 * 86400000)
        previousEndDate = startDate
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 86400000)
        previousStartDate = new Date(now.getTime() - 60 * 86400000)
        previousEndDate = startDate
        break
      case '3months':
        startDate = new Date(now.getTime() - 90 * 86400000)
        previousStartDate = new Date(now.getTime() - 180 * 86400000)
        previousEndDate = startDate
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 86400000)
        previousStartDate = new Date(now.getTime() - 730 * 86400000)
        previousEndDate = startDate
        break
    }

    const filteredWorkouts = workouts.filter(w => new Date(w.createdAt) >= startDate)
    const previousWorkouts = workouts.filter(w => {
      const date = new Date(w.createdAt)
      return date >= previousStartDate && date < previousEndDate
    })

    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Core']
    const muscleDistributionData: Record<string, number> = {}

    // Helper: map exercise name to muscle groups
    const categorizeName = (n: string): string[] => {
      const name = n.toLowerCase()
      const cats: string[] = []
      if (name.includes('push-up') || name.includes('pushup') || name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('pec')) cats.push('Chest')
      if (name.includes('bicep') || name.includes('curl') || name.includes('hammer')) cats.push('Biceps')
      if (name.includes('tricep') || name.includes('dip') || name.includes('extension') || name.includes('skull') || name.includes('kickback')) cats.push('Triceps')
      if (name.includes('squat') || name.includes('quad') || name.includes('lunge') || name.includes('leg press') || name.includes('leg extension')) cats.push('Quads')
      if (name.includes('hamstring') || name.includes('deadlift') || name.includes('leg curl') || name.includes('rdl') || name.includes('hip thrust') || name.includes('glute')) cats.push('Hamstrings')
      if (name.includes('shoulder') || name.includes('lateral raise') || name.includes('front raise') || name.includes('rear delt') || name.includes('military') || (name.includes('press') && !name.includes('bench') && !name.includes('leg'))) cats.push('Shoulders')
      if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('back') || name.includes('chin')) cats.push('Back')
      if (name.includes('ab') || name.includes('crunch') || name.includes('plank') || name.includes('core') || name.includes('sit-up') || name.includes('situp')) cats.push('Core')
      return cats
    }

    // Primary source: workout_sessions (has exercise names embedded)
    const filteredSessions = workoutSessions.filter(s => new Date(s.createdAt) >= startDate)
    const sessionExerciseIds = new Set<string>()
    filteredSessions.forEach(session => {
      session.exercisesData.forEach(ex => {
        sessionExerciseIds.add(ex.exerciseId)
        let categories = categorizeName(ex.exerciseName)
        if (categories.length === 0) {
          if (ex.exerciseCategory === 'upper-body') categories = ['Chest']
          else if (ex.exerciseCategory === 'lower-body') categories = ['Quads']
          else categories = ['Core']
        }
        const totalReps = ex.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.reps || 0), 0)
        if (totalReps > 0) {
          categories.forEach(cat => { muscleDistributionData[cat] = (muscleDistributionData[cat] || 0) + totalReps })
        }
      })
    })

    // Secondary source: workouts table (for manual entries / entries not in sessions)
    filteredWorkouts.forEach(workout => {
      if (sessionExerciseIds.has(workout.exerciseId)) return
      const exercise = allExercises.find(e => e.id === workout.exerciseId)
        || EXERCISES_SEED.find(e => e.id === workout.exerciseId)
      if (exercise) {
        let categories = categorizeName(exercise.name)
        if (categories.length === 0) {
          if (exercise.category === 'upper-body') categories = ['Chest']
          else if (exercise.category === 'lower-body') categories = ['Quads']
          else categories = ['Core']
        }
        categories.forEach(cat => { muscleDistributionData[cat] = (muscleDistributionData[cat] || 0) + workout.repCount })
      }
    })

    const maxReps = Math.max(...Object.values(muscleDistributionData), 1)
    const distribution = muscleGroups.map(group => ({
      name: group,
      value: ((muscleDistributionData[group] || 0) / maxReps) * 100
    }))

    const calcVolume = (wList: typeof workouts) => wList.reduce((sum, w) => {
      const exercise = EXERCISES_SEED.find(e => e.id === w.exerciseId)
      const name = exercise?.name.toLowerCase() || ''
      if (name.includes('push-up') || name.includes('pushup') ||
        name.includes('squat') && !name.includes('barbell') && !name.includes('dumbbell') ||
        name.includes('pull-up') || name.includes('chin-up') || name.includes('dip') && !name.includes('weighted')) return sum
      const isLeg = name.includes('leg') || name.includes('deadlift')
      return sum + (w.repCount * (isLeg ? 135 : 45))
    }, 0)

    return {
      muscleDistribution: distribution,
      periodStats: {
        workouts: filteredWorkouts.length,
        duration: filteredWorkouts.reduce((sum, w) => sum + (w.durationMs || 0), 0),
        reps: filteredWorkouts.reduce((sum, w) => sum + w.repCount, 0),
        volume: calcVolume(filteredWorkouts),
        videos: filteredWorkouts.filter(w => w.videoUrl).length,
        sets: filteredWorkouts.length
      },
      previousPeriodStats: {
        workouts: previousWorkouts.length,
        duration: previousWorkouts.reduce((sum, w) => sum + (w.durationMs || 0), 0),
        reps: previousWorkouts.reduce((sum, w) => sum + w.repCount, 0),
        volume: calcVolume(previousWorkouts),
        videos: previousWorkouts.filter(w => w.videoUrl).length,
        sets: previousWorkouts.length
      }
    }
  }, [workouts, workoutSessions, allExercises, muscleDistributionPeriod])

  // ─── Video workouts by exercise ─────────────────────────────
  const videoWorkoutsByExercise = useMemo(() => {
    const grouped = new Map<string, typeof workouts>()
    workouts.filter(w => w.videoUrl).forEach(workout => {
      const exerciseName = getExerciseName(workout.exerciseId)
      if (!grouped.has(exerciseName)) grouped.set(exerciseName, [])
      grouped.get(exerciseName)!.push(workout)
    })
    return grouped
  }, [workouts])

  const handlePlayVideo = async (videoUrl: string, exerciseName: string) => {
    setIsLoadingVideo(true)
    setSelectedWorkoutName(exerciseName)
    try {
      const videoRepo = new VideoStorageRepository()
      const playableUrl = await videoRepo.getVideoUrl(videoUrl)
      setSelectedVideoUrl(playableUrl)
    } catch (err) {
      console.error('Failed to get video URL:', err)
      setSelectedVideoUrl(videoUrl)
    } finally {
      setIsLoadingVideo(false)
    }
  }

  const handleCloseVideo = () => {
    setSelectedVideoUrl(null)
    setSelectedWorkoutName('')
  }

  const toggleExercise = (exerciseName: string) => {
    const newExpanded = new Set(expandedExercises)
    if (newExpanded.has(exerciseName)) newExpanded.delete(exerciseName)
    else newExpanded.add(exerciseName)
    setExpandedExercises(newExpanded)
  }

  // ─── Video stats ────────────────────────────────────────────
  const videoStats = useMemo(() => {
    const videoWorkoutsArray = workouts.filter(w => w.videoUrl)
    const scored = videoWorkoutsArray.filter(w => w.formScore !== null)
    const avgFormScore = scored.length > 0
      ? Math.round(scored.reduce((sum, w) => sum + (w.formScore || 0), 0) / scored.length)
      : 0
    const totalDuration = videoWorkoutsArray.reduce((sum, w) => sum + (w.durationMs || 0), 0)
    const avgReps = videoWorkoutsArray.length > 0
      ? Math.round(videoWorkoutsArray.reduce((sum, w) => sum + w.repCount, 0) / videoWorkoutsArray.length)
      : 0

    const formScoreData = scored
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((w, index) => ({ index: index + 1, score: w.formScore || 0, date: formatDate(w.createdAt) }))

    const repsData = videoWorkoutsArray
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((w, index) => ({ index: index + 1, reps: w.repCount, date: formatDate(w.createdAt) }))

    return { totalVideos: videoWorkoutsArray.length, avgFormScore, totalDuration, avgReps, formScoreData, repsData }
  }, [workouts])

  if (isLoading && workouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tabs = [
    { key: 'charts' as const, label: 'Charts', icon: BarChart3 },
    { key: 'log' as const, label: 'Log', icon: Activity },
    { key: 'videos' as const, label: 'Videos', icon: Video },
  ]

  const periodLabels: Record<string, string> = {
    week: 'Last 7 days', month: 'Last 30 days', '3months': 'Last 3 months', year: 'Last year'
  }

  return (
    <div className="pb-8 space-y-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <ScrollSection>
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          History
        </motion.h1>
        <motion.p
          className="text-gray-500 text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your workout journey at a glance.
        </motion.p>
      </ScrollSection>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* ─── Bento Stats Grid ───────────────────────────────── */}
      <ScrollSection delay={0.1}>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <StatCard icon={Dumbbell} label="Workouts" value={sessionStats.totalSessions + stats.totalWorkouts} color="cyan" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard icon={TrendingUp} label="Total Volume" value={Math.round(sessionStats.totalVolume)} suffix="lbs" color="purple" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard icon={Target} label="Heaviest Lift" value={sessionStats.heaviestLift} suffix="lbs" color="green" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard icon={Flame} label="Streak" value={stats.currentStreak} suffix="days" color="orange" />
          </motion.div>
        </motion.div>
      </ScrollSection>

      {/* ─── Tab Bar ────────────────────────────────────────── */}
      <ScrollSection delay={0.15}>
        <div className="flex bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium relative z-10 transition-colors duration-200 ${
                activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-cyan-500/80 shadow-lg shadow-cyan-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </ScrollSection>

      {/* ─── Tab Content ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ═══ Charts Tab ═══ */}
        {activeTab === 'charts' && (
          <motion.div
            key="charts"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Consistency Heatmap */}
            <ScrollSection>
              <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {calendarView === 'month' 
                      ? new Date(stats.currentYear, stats.currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : `${stats.currentYear} Overview`
                    }
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-dark-900/80 p-0.5">
                      {(['month', 'year'] as const).map(view => (
                        <button
                          key={view}
                          onClick={() => setCalendarView(view)}
                          className={`px-3 py-1 text-xs capitalize transition-colors ${
                            calendarView === view
                              ? 'bg-cyan-500/80 text-white'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                    <Flame size={14} className="text-orange-400" />
                    <span className="text-orange-400 text-xs font-semibold">{stats.currentStreak} day streak</span>
                  </div>
                </div>

                {calendarView === 'month' ? (
                  <>
                    <div className="grid grid-cols-7 gap-1.5">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[9px] text-gray-600 font-mono pb-1">{day}</div>
                      ))}
                      {stats.currentMonthCalendar.map((day, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.01 }}
                          className={`aspect-square flex items-center justify-center text-[9px] font-mono relative ${
                            !day ? ''
                              : day.isToday
                                ? 'bg-cyan-500/30 ring-1 ring-cyan-400 text-cyan-300'
                                : day.hasWorkout
                                  ? 'bg-cyan-500/25 text-cyan-300'
                                  : 'bg-dark-700/40 text-gray-600'
                          }`}
                        >
                          {day?.day}
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {stats.yearCalendar.map((monthData) => (
                      <div key={monthData.month}>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-mono">{monthData.label}</p>
                        <div className="grid grid-cols-7 gap-[2px]">
                          {monthData.days.map((day, i) => (
                            <div
                              key={i}
                              className={`aspect-square ${
                                !day ? ''
                                  : day.isToday
                                    ? 'bg-cyan-500/40 ring-1 ring-cyan-400'
                                    : day.hasWorkout
                                      ? 'bg-cyan-500/30'
                                      : 'bg-dark-700/40'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-dark-700/40" />
                    <span className="text-[8px] text-gray-600">Rest</span>
                    <div className="w-3 h-3 bg-cyan-500/25 ml-1" />
                    <span className="text-[8px] text-gray-600">Active</span>
                  </div>
                  <span className="text-[8px] text-gray-500">
                    {stats.workoutDays} active days total
                  </span>
                </div>
              </div>
            </ScrollSection>

            {/* Muscle Distribution — Full Width at Top */}
            <ScrollSection delay={0.05}>
              <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Muscle Distribution</h3>

                  {/* Period Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMuscleDistributionDropdownOpen(!muscleDistributionDropdownOpen)}
                      className="flex items-center gap-1.5 bg-dark-700/60 text-gray-300 px-3 py-1.5 text-xs hover:bg-dark-600/60 transition-colors"
                    >
                      {periodLabels[muscleDistributionPeriod]}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${muscleDistributionDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {muscleDistributionDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-dark-800 border border-dark-700 z-20 min-w-[140px] shadow-xl">
                        {(['week', 'month', '3months', 'year'] as const).map(period => (
                          <button
                            key={period}
                            onClick={() => { setMuscleDistributionPeriod(period); setMuscleDistributionDropdownOpen(false) }}
                            className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                              muscleDistributionPeriod === period
                                ? 'text-cyan-400 bg-cyan-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-dark-700'
                            }`}
                          >
                            {periodLabels[period]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <MuscleDistributionChart data={muscleDistribution} className="max-w-md mx-auto" />

                {/* Period comparison stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Workouts', current: periodStats.workouts, prev: previousPeriodStats.workouts },
                    { label: 'Reps', current: periodStats.reps, prev: previousPeriodStats.reps },
                    { label: 'Sets', current: periodStats.sets, prev: previousPeriodStats.sets },
                  ].map(({ label, current, prev }) => {
                    const diff = current - prev
                    return (
                      <div key={label} className="bg-dark-700/40 border border-dark-600/40 p-3 text-center">
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
                        <p className="text-white text-lg font-bold">{current}</p>
                        <p className={`text-[10px] flex items-center justify-center gap-0.5 ${diff >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                          <TrendingUp size={10} />
                          {diff >= 0 ? '+' : ''}{diff}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollSection>

            {/* Volume Trend + Rep Consistency — Side by Side */}
            <ScrollSection delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Volume Trend Area Chart */}
                <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Volume Trend</h3>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sessionStats.volumeByDay}>
                        <defs>
                          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            fontSize: 11,
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()} lbs`, 'Volume']}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          fill="url(#volumeGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Muscles Hit — D3 Horizontal Bar Chart */}
                <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Muscles Hit This Week</h3>
                  <div className="h-36">
                    <MuscleHitBarChart data={sessionStats.muscleHitData} />
                  </div>
                </div>
              </div>
            </ScrollSection>
          </motion.div>
        )}

        {/* ═══ Log Tab ═══ */}
        {activeTab === 'log' && (
          <motion.div
            key="log"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recent Workouts</h2>
              <span className="text-xs text-gray-600">{workoutSessions.length} total</span>
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : workoutSessions.length === 0 ? (
              <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-12 text-center">
                <Target className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 text-lg">No workouts yet</p>
                <p className="text-gray-600 text-sm mt-1">Complete a routine workout to see it here</p>
              </div>
            ) : (
              <motion.div
                className="space-y-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {workoutSessions.map((session) => (
                  <WorkoutSessionCard
                    key={session.id}
                    session={session}
                    onDelete={() => handleDeleteSession(session.id)}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══ Videos Tab ═══ */}
        {activeTab === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Video Workouts</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVideoStats(!showVideoStats)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    showVideoStats
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-dark-700/60 text-gray-400 hover:text-white border border-dark-600/40'
                  }`}
                >
                  <BarChart3 size={14} />
                  Stats
                </button>

                {showVideoStats && (
                  <div className="flex bg-dark-900/80 p-0.5">
                    {(['stats', 'charts'] as const).map(view => (
                      <button
                        key={view}
                        onClick={() => setVideoStatsView(view)}
                        className={`px-2.5 py-1 text-xs capitalize transition-colors ${
                          videoStatsView === view
                            ? 'bg-cyan-500/80 text-white'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video Stats Panel */}
            <AnimatePresence>
              {showVideoStats && videoStatsView === 'stats' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Total Videos', value: videoStats.totalVideos, color: 'text-white' },
                        { label: 'Avg Form Score', value: videoStats.avgFormScore, color: 'text-cyan-400' },
                        { label: 'Total Duration', value: `${Math.floor(videoStats.totalDuration / 60000)}min`, color: 'text-white' },
                        { label: 'Avg Reps/Video', value: videoStats.avgReps, color: 'text-white' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-dark-700/40 border border-dark-600/40 p-3">
                          <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {showVideoStats && videoStatsView === 'charts' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4 space-y-6">
                    {videoStats.formScoreData.length > 0 && (
                      <div>
                        <h4 className="text-cyan-400 text-xs mb-3 font-medium uppercase tracking-wider">Form Score Progress</h4>
                        <LineChart
                          data={videoStats.formScoreData.map((d, i) => ({ index: i, value: d.score, label: '' }))}
                          color="rgb(34, 197, 94)"
                          maxValue={100}
                          height={200}
                        />
                      </div>
                    )}
                    {videoStats.repsData.length > 0 && (
                      <div>
                        <h4 className="text-cyan-400 text-xs mb-3 font-medium uppercase tracking-wider">Reps Per Workout</h4>
                        <LineChart
                          data={videoStats.repsData.map((d, i) => ({ index: i, value: d.reps, label: '' }))}
                          color="rgb(59, 130, 246)"
                          height={200}
                        />
                      </div>
                    )}
                    {videoStats.formScoreData.length === 0 && videoStats.repsData.length === 0 && (
                      <div className="text-center py-8 text-gray-600 text-sm">No data available</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video exercise groups */}
            {videoWorkoutsByExercise.size === 0 ? (
              <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-12 text-center">
                <Video className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 text-lg">No video workouts yet</p>
                <p className="text-gray-600 text-sm mt-1">Complete a workout with video recording to see it here</p>
              </div>
            ) : (
              <motion.div
                className="space-y-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {Array.from(videoWorkoutsByExercise.entries()).map(([exerciseName, exerciseWorkouts]) => (
                  <motion.div
                    key={exerciseName}
                    variants={staggerItem}
                    className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExercise(exerciseName)}
                      className="w-full flex items-center justify-between p-4 hover:bg-dark-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                          <Video size={16} className="text-cyan-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-medium text-sm">{exerciseName}</h3>
                          <span className="text-xs text-gray-500">{exerciseWorkouts.length} recordings</span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedExercises.has(exerciseName) ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} className="text-gray-500" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedExercises.has(exerciseName) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2 border-t border-dark-700/40">
                            {exerciseWorkouts.map((workout) => (
                              <motion.div
                                key={workout.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-dark-700/30 border border-dark-600/30 p-3 flex items-center justify-between mt-2"
                              >
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <Calendar size={12} />
                                  <span>{formatDate(workout.createdAt)}</span>
                                  <Clock size={12} />
                                  <span>{formatTime(workout.createdAt)}</span>
                                  {workout.durationMs > 0 && <span className="text-gray-500">{formatDuration(workout.durationMs)}</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handlePlayVideo(workout.videoUrl!, exerciseName)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-500/15 text-cyan-400 text-xs hover:bg-cyan-500/25 transition-colors"
                                  >
                                    <Play size={12} />
                                    Play
                                  </button>
                                  <div className="text-right">
                                    <p className="text-cyan-400 font-bold text-sm">{workout.repCount}</p>
                                    <p className="text-[9px] text-gray-500">reps</p>
                                  </div>
                                  {workout.formScore !== null && (
                                    <div className="text-right">
                                      <p className="text-white font-semibold text-sm">{workout.formScore}</p>
                                      <p className="text-[9px] text-gray-500">form</p>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => deleteWorkout(workout.id)}
                                    className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Video Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedVideoUrl || isLoadingVideo}
        onClose={handleCloseVideo}
        title={`${selectedWorkoutName} - Replay`}
      >
        {isLoadingVideo ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-400">Loading video...</span>
          </div>
        ) : selectedVideoUrl ? (
          <div className="space-y-4">
            <video src={selectedVideoUrl} controls autoPlay className="w-full aspect-video bg-black" />
            <div className="flex justify-end">
              <button
                onClick={handleCloseVideo}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

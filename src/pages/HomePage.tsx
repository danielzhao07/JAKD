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
  Target,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { useHistoryStore } from '@/store/historyStore'
import { useRoutineStore } from '@/store/routineStore'
import { useExerciseStore } from '@/store/exerciseStore'
import { useWorkoutSessionStore } from '@/store/workoutSessionStore'
import { useProfileStore } from '@/store/profileStore'
import { GOAL_TYPE_LABELS } from '@/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { ROUTES, EXERCISES_SEED } from '@/utils/constants'
import { MuscleDistributionChart } from '@/components/charts/MuscleDistributionChart'
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
      transition={{ duration: 0.75, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Daily Quotes ───────────────────────────────────────────────

const DAILY_QUOTES = [
  { text: 'The last three or four reps is what makes the muscle grow.', author: 'Arnold Schwarzenegger' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
  { text: 'The iron never lies to you. Two hundred pounds is always two hundred pounds.', author: 'Henry Rollins' },
  { text: 'No citizen has a right to be an amateur in the matter of physical training.', author: 'Socrates' },
  { text: 'I hated every minute of training, but I said, don\'t quit. Suffer now and live the rest of your life as a champion.', author: 'Muhammad Ali' },
  { text: 'The successful warrior is the average man, with laser-like focus.', author: 'Bruce Lee' },
  { text: 'Once you learn to quit, it becomes a habit.', author: 'Vince Lombardi' },
  { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.', author: 'Aristotle' },
  { text: 'Don\'t count the days, make the days count.', author: 'Muhammad Ali' },
  { text: 'The resistance that you fight physically in the gym can only build a strong character.', author: 'Arnold Schwarzenegger' },
  { text: 'If something stands between you and your success, move it. Never be denied.', author: 'Dwayne Johnson' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { text: 'The only way to define your limits is by going beyond them.', author: 'Arthur C. Clarke' },
  { text: 'Everybody wants to be a bodybuilder, but nobody wants to lift no heavy weights.', author: 'Ronnie Coleman' },
  { text: 'The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it.', author: 'Arnold Schwarzenegger' },
  { text: 'There is no reason to be alive if you can\'t do deadlift.', author: 'J\u00F3n P\u00E1ll Sigmarsson' },
  { text: 'To give anything less than your best is to sacrifice the gift.', author: 'Steve Prefontaine' },
  { text: 'The only place where success comes before work is in the dictionary.', author: 'Vidal Sassoon' },
  { text: 'What we face may look insurmountable. But I learned something from all those years of training. I learned something from all those sets and reps. That there is no such thing as failure.', author: 'Arnold Schwarzenegger' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: 'The difference between the impossible and the possible lies in a person\'s determination.', author: 'Tommy Lasorda' },
  { text: 'To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.', author: 'Buddha' },
  { text: 'A champion is someone who gets up when they can\'t.', author: 'Jack Dempsey' },
  { text: 'The real workout starts when you want to stop.', author: 'Ronnie Coleman' },
  { text: 'Strength is the product of struggle.', author: 'Marcus Tullius Cicero' },
  { text: 'I don\'t stop when I\'m tired. I stop when I\'m done.', author: 'David Goggins' },
  { text: 'The more you sweat in training, the less you bleed in combat.', author: 'Richard Marcinko' },
  { text: 'Your love for what you do and willingness to push yourself where others aren\'t prepared to go is what will make you great.', author: 'Laurence Shahlaei' },
  { text: 'Not every day is going to be a good day. Just make sure you show up.', author: 'Dorian Yates' },
]

function getDailyQuote(): { text: string; author: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}

// ─── Component ──────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { startWorkout } = useWorkoutStore()
  const { workouts, loadWorkouts } = useHistoryStore()
  const { routines, fetchRoutines } = useRoutineStore()
  const { exercises, fetchExercises } = useExerciseStore()
  const { activeGoals, loadActiveGoals } = useProfileStore()

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const dailyQuote = useMemo(() => getDailyQuote(), [])

  // Load data on mount
  useEffect(() => {
    loadWorkouts()
    fetchExercises()
    if (user) {
      fetchRoutines(user.id)
      loadActiveGoals(user.id)
    }
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

  // ─── Muscle Distribution Data (This Week Only) ──────────────────────────
  const muscleDistribution = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeekWorkouts = workouts.filter((w) => new Date(w.createdAt) >= startOfWeek)

    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Core']
    const muscleData: Record<string, number> = {}

    thisWeekWorkouts.forEach(workout => {
      const exercise = exercises.find(e => e.id === workout.exerciseId)
        || EXERCISES_SEED.find(e => e.id === workout.exerciseId)
      if (exercise) {
        const name = exercise.name.toLowerCase()
        const categories: string[] = []
        if (name.includes('push-up') || name.includes('pushup') || name.includes('bench') || name.includes('chest') || name.includes('fly')) categories.push('Chest')
        if (name.includes('bicep') || name.includes('curl')) categories.push('Biceps')
        if (name.includes('tricep') || name.includes('dip') || name.includes('extension')) categories.push('Triceps')
        if (name.includes('squat') || name.includes('quad') || name.includes('lunge') || name.includes('leg press')) categories.push('Quads')
        if (name.includes('hamstring') || name.includes('deadlift') || name.includes('leg curl')) categories.push('Hamstrings')
        if (name.includes('shoulder') || (name.includes('press') && !name.includes('bench') && !name.includes('leg'))) categories.push('Shoulders')
        if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('back')) categories.push('Back')
        if (name.includes('ab') || name.includes('crunch') || name.includes('plank') || name.includes('core')) categories.push('Core')
        if (categories.length === 0) categories.push('Core')
        categories.forEach(cat => { muscleData[cat] = (muscleData[cat] || 0) + workout.repCount })
      }
    })

    const maxReps = Math.max(...Object.values(muscleData), 1)
    return muscleGroups.map(group => ({
      name: group,
      value: ((muscleData[group] || 0) / maxReps) * 100
    }))
  }, [workouts, exercises])

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

      {/* ─── Dashboard Grid ──────────────────────────────────── */}
      <ScrollSection>
        <div className="bg-dark-800 border border-dark-700 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* ── TOP-LEFT: Calendar ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  {currentMonthLabel}
                </h2>
                <Calendar size={14} className="text-gray-600" />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-[8px] text-gray-600 text-center font-mono">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
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
              <div className="flex items-center justify-end gap-1.5 mt-2">
                <div className="w-2.5 h-2.5 bg-dark-700/60" />
                <span className="text-[8px] text-gray-600">No workout</span>
                <div className="w-2.5 h-2.5 bg-cyan-500/40 ml-1" />
                <span className="text-[8px] text-gray-600">Workout</span>
              </div>
            </div>

            {/* ── TOP-RIGHT: Muscle Distribution ── */}
            <div className="flex items-center justify-center min-h-[320px]">
              <div className="w-full max-w-[440px]">
                <MuscleDistributionChart data={muscleDistribution} />
              </div>
            </div>

            {/* ── BOTTOM-LEFT: This Week Stats + Daily Bars ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">This Week</h2>
                <BarChart3 size={14} className="text-gray-600" />
              </div>
              <div className="space-y-1.5">
                <motion.div
                  className="flex items-center gap-3 p-2 bg-dark-700/40 border border-dark-600/50"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 flex-shrink-0">
                    <TrendingUp size={14} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white leading-none">{stats.workoutsThisWeek}</p>
                    <p className="text-gray-500 text-[10px]">Workouts</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-2 bg-dark-700/40 border border-dark-600/50"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-purple-500/15 border border-purple-500/30 flex-shrink-0">
                    <Dumbbell size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white leading-none">{stats.totalReps}</p>
                    <p className="text-gray-500 text-[10px]">Total Reps</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-2 bg-dark-700/40 border border-dark-600/50"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-green-500/15 border border-green-500/30 flex-shrink-0">
                    <Timer size={14} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white leading-none">{formatDuration(stats.totalTime)}</p>
                    <p className="text-gray-500 text-[10px]">Active Time</p>
                  </div>
                </motion.div>
              </div>

              {/* Daily Quote */}
              <div className="bg-dark-700/40 border border-dark-600/50 p-3 mt-2">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400/60 text-lg leading-none mt-0.5">“</span>
                  <div>
                    <p className="text-[11px] text-gray-300 italic leading-relaxed">{dailyQuote.text}</p>
                    <p className="text-[10px] text-gray-500 mt-1.5">{dailyQuote.author}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM-RIGHT: Goals ── */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-3">
                <Target size={12} className="text-cyan-400" />
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Goals</span>
              </div>

              {activeGoals.length > 0 ? (
                <div className="flex flex-wrap gap-6 items-center justify-center flex-1">
                  {activeGoals.slice(0, 4).map((goal) => {
                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
                    const isComplete = goal.currentValue >= goal.targetValue
                    const circumference = 2 * Math.PI * 44
                    const strokeDashoffset = circumference - (progress / 100) * circumference

                    return (
                      <motion.div
                        key={goal.id}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative w-40 h-40">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle
                              cx="50" cy="50" r="44"
                              fill="none"
                              stroke="rgba(55, 65, 81, 0.4)"
                              strokeWidth="7"
                            />
                            <motion.circle
                              cx="50" cy="50" r="44"
                              fill="none"
                              stroke={isComplete ? '#06b6d4' : progress >= 80 ? '#06b6d4' : '#0891b2'}
                              strokeWidth="7"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset }}
                              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                              style={{
                                filter: isComplete ? 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.6))' : 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.2))',
                              }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-bold leading-none ${isComplete ? 'text-cyan-400' : 'text-white'}`}>
                              {progress.toFixed(0)}%
                            </span>
                            {isComplete ? (
                              <Zap size={14} className="text-cyan-400 mt-1" />
                            ) : (
                              <span className="text-[10px] text-gray-500 mt-1">
                                {goal.currentValue}/{goal.targetValue}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {GOAL_TYPE_LABELS[goal.goalType].replace(' Goal', '')}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <motion.button
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="w-full p-6 bg-dark-700/40 border border-dashed border-dark-600/60 hover:border-cyan-500/30 transition-all group flex-1 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                      <Target size={28} className="text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Set a Weekly Goal</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">Track your progress here</p>
                    </div>
                  </div>
                </motion.button>
              )}
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
    </div>
  )
}

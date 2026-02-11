import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'
import { useHistoryStore } from '@/store/historyStore'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { GoalsProgressCard } from '@/components/profile/GoalsProgressCard'
import { AccountSettings } from '@/components/profile/AccountSettings'
import { CreateGoalModal } from '@/components/profile/CreateGoalModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { WorkoutSessionRepository, type WorkoutSessionModel } from '@/repositories/WorkoutSessionRepository'
import { Trophy, Dumbbell, Flame, Timer } from 'lucide-react'
import type { CreateGoalInput, UpdatePreferencesInput } from '@/types'

// ─── Animation helpers ──────────────────────────────────────────
function ScrollSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ProfilePage() {
  const { user, signOut } = useAuthStore()
  const {
    activeGoals,
    isLoadingGoals,
    preferences,
    isLoadingPreferences,
    loadActiveGoals,
    createGoal,
    deleteGoal,
    loadPreferences,
    updatePreferences,
  } = useProfileStore()
  const { workouts, loadWorkouts } = useHistoryStore()

  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false)
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionModel[]>([])

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      loadActiveGoals(user.id)
      loadPreferences(user.id)
    }
  }, [user?.id, loadActiveGoals, loadPreferences])

  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return
      try {
        const sessions = await WorkoutSessionRepository.getUserWorkoutSessions(user.id)
        setWorkoutSessions(sessions)
      } catch (err) {
        console.error('Failed to load workout sessions:', err)
      }
    }
    loadSessions()
  }, [user])

  // ─── Personal Bests ─────────────────────────────────────────
  const personalBests = useMemo(() => {
    // Heaviest single lift
    let heaviestLift = 0
    let heaviestExercise = ''
    workoutSessions.forEach(s => {
      s.exercisesData.forEach(ex => {
        ex.sets.filter(set => set.completed).forEach(set => {
          const weight = typeof set.weight === 'string' ? parseFloat(set.weight) || 0 : (set.weight || 0)
          if (weight > heaviestLift) {
            heaviestLift = weight
            heaviestExercise = ex.exerciseName
          }
        })
      })
    })

    // Max volume in a single session
    let maxVolume = 0
    let maxVolumeSession = ''
    workoutSessions.forEach(s => {
      if (s.totalVolume > maxVolume) {
        maxVolume = s.totalVolume
        maxVolumeSession = s.routineName || 'Workout'
      }
    })

    // Longest workout
    let longestDuration = 0
    let longestSession = ''
    workoutSessions.forEach(s => {
      if (s.durationSeconds > longestDuration) {
        longestDuration = s.durationSeconds
        longestSession = s.routineName || 'Workout'
      }
    })

    // Most reps in a single session
    let mostReps = 0
    let mostRepsSession = ''
    workoutSessions.forEach(s => {
      const sessionReps = s.exercisesData.reduce((sum, ex) => 
        sum + ex.sets.filter(set => set.completed).reduce((sSum, set) => sSum + (set.reps || 0), 0), 0)
      if (sessionReps > mostReps) {
        mostReps = sessionReps
        mostRepsSession = s.routineName || 'Workout'
      }
    })

    const formatDur = (secs: number) => {
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      if (h > 0) return `${h}h ${m}m`
      return `${m}m`
    }

    return [
      { icon: Dumbbell, label: 'Heaviest Lift', value: heaviestLift > 0 ? `${heaviestLift} lbs` : '—', sub: heaviestExercise || 'No data yet', color: 'cyan' },
      { icon: Flame, label: 'Max Volume', value: maxVolume > 0 ? `${maxVolume.toLocaleString()} lbs` : '—', sub: maxVolumeSession || 'No data yet', color: 'orange' },
      { icon: Timer, label: 'Longest Workout', value: longestDuration > 0 ? formatDur(longestDuration) : '—', sub: longestSession || 'No data yet', color: 'green' },
      { icon: Trophy, label: 'Most Reps', value: mostReps > 0 ? `${mostReps}` : '—', sub: mostRepsSession || 'No data yet', color: 'purple' },
    ]
  }, [workoutSessions])

  const handleCreateGoal = async (input: CreateGoalInput) => {
    if (!user?.id) return
    await createGoal(user.id, input)
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.id) return
    try {
      await deleteGoal(goalId, user.id)
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const handleUpdatePreferences = async (updates: UpdatePreferencesInput) => {
    if (!user?.id) return
    await updatePreferences(user.id, updates)
  }

  const handleUpdateNotifications = async (enabled: boolean) => {
    await handleUpdatePreferences({ notificationsEnabled: enabled })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Please sign in to view your profile</p>
      </div>
    )
  }

  const isLoading = isLoadingGoals || isLoadingPreferences

  return (
    <div className="pb-8 space-y-6">
      {/* Header */}
      <ScrollSection>
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Your fitness identity & progress.</p>
          </div>
        </motion.div>
      </ScrollSection>

      {/* Player Card */}
      <ScrollSection delay={0.1}>
        <ProfileHeader
          email={user.email || ''}
          totalWorkouts={workouts.length}
        />
      </ScrollSection>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <LoadingSpinner size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Goals & Milestones */}
            <ScrollSection delay={0.15}>
              <GoalsProgressCard
                goals={activeGoals}
                onCreateGoal={() => setIsCreateGoalModalOpen(true)}
                onDeleteGoal={handleDeleteGoal}
              />
            </ScrollSection>

            {/* Personal Bests */}
            <ScrollSection delay={0.2}>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Personal Bests</h3>
                <div className="grid grid-cols-2 gap-3">
                  {personalBests.map((pb) => {
                    const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
                      cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'from-cyan-500/5' },
                      orange: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'from-orange-500/5' },
                      green: { bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400', glow: 'from-green-500/5' },
                      purple: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'from-purple-500/5' },
                    }
                    const c = colorMap[pb.color] || colorMap.cyan
                    return (
                      <motion.div
                        key={pb.label}
                        className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4 relative overflow-hidden group hover:border-cyan-500/20 transition-colors"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${c.glow} to-transparent`} />
                        <div className={`w-9 h-9 flex items-center justify-center ${c.bg} ${c.border} border mb-3`}>
                          <pb.icon size={18} className={c.text} />
                        </div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{pb.label}</p>
                        <p className="text-xl font-bold text-white">{pb.value}</p>
                        <p className={`text-xs mt-1 ${c.text} truncate opacity-70`}>{pb.sub}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </ScrollSection>

            {/* Account Settings */}
            {preferences && (
              <ScrollSection delay={0.25}>
                <AccountSettings
                  preferences={preferences}
                  onUpdateNotifications={handleUpdateNotifications}
                  onSignOut={signOut}
                />
              </ScrollSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateGoalModalOpen}
        onClose={() => setIsCreateGoalModalOpen(false)}
        onCreate={handleCreateGoal}
      />
    </div>
  )
}

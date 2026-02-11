import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'
import { useHistoryStore } from '@/store/historyStore'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { GoalsProgressCard } from '@/components/profile/GoalsProgressCard'
import { WorkoutPreferences } from '@/components/profile/WorkoutPreferences'
import { AccountSettings } from '@/components/profile/AccountSettings'
import { CreateGoalModal } from '@/components/profile/CreateGoalModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
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

  const handleCreateGoal = async (input: CreateGoalInput) => {
    if (!user?.id) return
    await createGoal(user.id, input)
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.id) return
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId, user.id)
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
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Profile
        </motion.h1>
        <motion.p
          className="text-gray-500 text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your fitness identity.
        </motion.p>
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

            {/* Workout Preferences */}
            {preferences && (
              <ScrollSection delay={0.2}>
                <WorkoutPreferences
                  preferences={preferences}
                  onUpdate={handleUpdatePreferences}
                />
              </ScrollSection>
            )}

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

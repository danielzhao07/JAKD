import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'
import type { UserGoal, GoalProgress } from '@/types'
import { GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '@/types'
import { Target, Plus, Trash2, CheckCircle2, Zap } from 'lucide-react'

interface GoalsProgressCardProps {
  goals: UserGoal[]
  onCreateGoal: () => void
  onDeleteGoal: (goalId: string) => void
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

export function GoalsProgressCard({ goals, onCreateGoal, onDeleteGoal }: GoalsProgressCardProps) {
  const calculateProgress = (goal: UserGoal): GoalProgress => {
    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    const remaining = Math.max(goal.targetValue - goal.currentValue, 0)
    const isComplete = goal.currentValue >= goal.targetValue

    let daysRemaining: number | undefined
    if (goal.endDate) {
      const endDate = new Date(goal.endDate)
      const today = new Date()
      const diffTime = endDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return { goal, progress, remaining, isComplete, daysRemaining }
  }

  const activeGoals = goals.filter((g) => g.isActive)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Target size={16} className="text-cyan-400" />
          Goals & Milestones
        </h3>
        <Button onClick={onCreateGoal} size="sm" className="flex items-center gap-1">
          <Plus size={14} />
          <span className="text-xs">New Goal</span>
        </Button>
      </div>

      {/* Goals List */}
      {activeGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-10 text-center"
        >
          <Target className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400">No active goals</p>
          <p className="text-sm text-gray-600 mt-1">Set a goal to track your progress</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {activeGoals.map((goal) => {
            const progress = calculateProgress(goal)
            const isNearComplete = progress.progress >= 80
            const isComplete = progress.isComplete

            return (
              <motion.div
                key={goal.id}
                variants={staggerItem}
                whileHover={{ scale: 1.01, y: -1 }}
                className={`bg-dark-800/60 backdrop-blur-md border p-4 relative overflow-hidden transition-all duration-300 ${
                  isComplete
                    ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : isNearComplete
                      ? 'border-cyan-500/25 shadow-md shadow-cyan-500/5'
                      : 'border-dark-700/60 hover:border-dark-600'
                }`}
              >
                {/* Glow for completed */}
                {isComplete && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                )}

                {/* Delete button */}
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors p-1 z-10"
                >
                  <Trash2 size={13} />
                </button>

                <div className="pr-8 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <CheckCircle2 size={20} className="text-cyan-400" />
                      </motion.div>
                    ) : (
                      <span className="text-lg">{GOAL_TYPE_ICONS[goal.goalType]}</span>
                    )}
                    <h4 className={`font-semibold text-sm ${isComplete ? 'text-cyan-400' : 'text-white'}`}>
                      {GOAL_TYPE_LABELS[goal.goalType]}
                    </h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500">
                        {goal.currentValue} / {goal.targetValue}{' '}
                        {goal.goalType.includes('reps') ? 'reps' : 'workouts'}
                      </span>
                      <span className={`font-bold ${isComplete ? 'text-cyan-400' : 'text-white'}`}>
                        {progress.progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-dark-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                        className={`h-full transition-all ${
                          isComplete
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-sm shadow-cyan-500/40'
                            : isNearComplete
                              ? 'bg-gradient-to-r from-cyan-500/80 to-cyan-400/80'
                              : 'bg-cyan-500/50'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 text-[10px]">
                    {!isComplete && progress.remaining > 0 && (
                      <span className="text-gray-500">{progress.remaining} remaining</span>
                    )}
                    {isComplete && (
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        <Zap size={10} /> Complete!
                      </span>
                    )}
                    {progress.daysRemaining !== undefined && progress.daysRemaining > 0 && (
                      <span className="text-gray-500">{progress.daysRemaining} days left</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'

interface ProfileHeaderProps {
  email: string
  displayName?: string
  totalWorkouts?: number
}

const RANK_TITLES = [
  'Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum',
  'Diamond', 'Master', 'Grandmaster', 'Legend', 'Mythic',
]

function getRankTitle(level: number): string {
  const idx = Math.min(Math.floor((level - 1) / 3), RANK_TITLES.length - 1)
  return RANK_TITLES[idx]
}

function getRankColor(level: number): string {
  if (level <= 3) return 'text-gray-400'
  if (level <= 6) return 'text-amber-500'
  if (level <= 9) return 'text-gray-300'
  if (level <= 12) return 'text-yellow-400'
  if (level <= 15) return 'text-cyan-400'
  if (level <= 18) return 'text-blue-400'
  if (level <= 21) return 'text-purple-400'
  if (level <= 24) return 'text-red-400'
  if (level <= 27) return 'text-orange-400'
  return 'text-pink-400'
}

export function ProfileHeader({ email, displayName, totalWorkouts = 0 }: ProfileHeaderProps) {
  const initials = email
    .split('@')[0]
    .split(/[._-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const level = Math.floor(totalWorkouts / 10) + 1
  const xpInLevel = totalWorkouts % 10
  const xpPercent = (xpInLevel / 10) * 100
  const rankTitle = getRankTitle(level)
  const rankColor = getRankColor(level)
  const animatedLevel = useCountUp(level)
  const animatedWorkouts = useCountUp(totalWorkouts)

  return (
    <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-transparent" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Breathing Avatar */}
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/20 flex items-center justify-center border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10"
            style={{ width: 72, height: 72 }}
          >
            <span className="text-2xl font-bold text-cyan-400">{initials}</span>
          </div>

          {/* Level badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/40 border-2 border-dark-800"
          >
            <span className="text-[10px] font-bold text-black">{animatedLevel}</span>
          </motion.div>
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">
            {displayName || email.split('@')[0]}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Shield size={12} className={rankColor} />
            <span className={`text-xs font-semibold ${rankColor}`}>{rankTitle}</span>
            <span className="text-gray-600 text-xs">Lv. {animatedLevel}</span>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">XP Progress</span>
              <span className="text-[10px] text-gray-400">{xpInLevel}/10</span>
            </div>
            <div className="h-1.5 bg-dark-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-sm shadow-cyan-500/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
        <div className="bg-dark-700/40 border border-dark-600/30 p-2 text-center">
          <p className="text-white font-bold text-sm">{animatedWorkouts}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Workouts</p>
        </div>
        <div className="bg-dark-700/40 border border-dark-600/30 p-2 text-center">
          <p className="text-cyan-400 font-bold text-sm">{animatedLevel}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Level</p>
        </div>
        <div className="bg-dark-700/40 border border-dark-600/30 p-2 text-center">
          <p className={`font-bold text-sm ${rankColor}`}>{rankTitle}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Rank</p>
        </div>
      </div>
    </div>
  )
}

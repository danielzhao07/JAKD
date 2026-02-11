import { motion } from 'framer-motion'
import type { UserPreferences, FormStrictness } from '@/types'
import {
  FORM_STRICTNESS_LABELS,
  FORM_STRICTNESS_DESCRIPTIONS,
  REST_TIMER_PRESETS,
  CAMERA_POSITIONS,
} from '@/types'
import { Sliders, Eye, Timer, Camera } from 'lucide-react'

interface WorkoutPreferencesProps {
  preferences: UserPreferences
  onUpdate: (updates: Partial<UserPreferences>) => void
}

function SettingRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      className="py-3 border-b border-dark-700/30 last:border-b-0"
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0 mt-0.5">
          <Icon size={14} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </motion.div>
  )
}

export function WorkoutPreferences({ preferences, onUpdate }: WorkoutPreferencesProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Sliders size={16} className="text-cyan-400" />
        Workout Preferences
      </h3>

      <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4 space-y-1">
        {/* Form Strictness */}
        <SettingRow icon={Eye}>
          <label className="block text-sm font-medium text-white mb-1.5">Form Strictness</label>
          <select
            value={preferences.formStrictness}
            onChange={(e) => onUpdate({ formStrictness: e.target.value as FormStrictness })}
            className="w-full px-3 py-2 bg-dark-700/60 border border-dark-600/40 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          >
            {(Object.keys(FORM_STRICTNESS_LABELS) as FormStrictness[]).map((level) => (
              <option key={level} value={level}>{FORM_STRICTNESS_LABELS[level]}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">
            {FORM_STRICTNESS_DESCRIPTIONS[preferences.formStrictness]}
          </p>
        </SettingRow>

        {/* Rep Detection Sensitivity */}
        <SettingRow icon={Sliders}>
          <label className="block text-sm font-medium text-white mb-1.5">Rep Detection Sensitivity</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.repDetectionSensitivity}
              onChange={(e) => onUpdate({ repDetectionSensitivity: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-dark-700 appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-sm font-semibold text-cyan-400 w-12 text-right">
              {(preferences.repDetectionSensitivity * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Higher sensitivity detects smaller movements</p>
        </SettingRow>

        {/* Default Rest Timer */}
        <SettingRow icon={Timer}>
          <label className="block text-sm font-medium text-white mb-1.5">Default Rest Timer</label>
          <select
            value={preferences.defaultRestSeconds}
            onChange={(e) => onUpdate({ defaultRestSeconds: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-dark-700/60 border border-dark-600/40 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          >
            {REST_TIMER_PRESETS.map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds >= 60 ? `${seconds / 60} minute${seconds / 60 > 1 ? 's' : ''}` : `${seconds} seconds`}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">Rest time between sets in routines</p>
        </SettingRow>

        {/* Camera Position */}
        <SettingRow icon={Camera}>
          <label className="block text-sm font-medium text-white mb-1.5">Camera Position</label>
          <select
            value={preferences.cameraPosition}
            onChange={(e) => onUpdate({ cameraPosition: e.target.value })}
            className="w-full px-3 py-2 bg-dark-700/60 border border-dark-600/40 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          >
            {CAMERA_POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">Preferred camera angle for exercises</p>
        </SettingRow>
      </div>
    </div>
  )
}

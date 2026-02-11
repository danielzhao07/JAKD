import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'
import type { UserPreferences } from '@/types'
import { Settings, Bell, BellOff, Download, Trash2, LogOut, Moon } from 'lucide-react'

interface AccountSettingsProps {
  preferences: UserPreferences
  onUpdateNotifications: (enabled: boolean) => void
  onSignOut: () => void
}

function SettingRow({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="py-3 border-b border-dark-700/30 last:border-b-0"
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

export function AccountSettings({
  preferences,
  onUpdateNotifications,
  onSignOut,
}: AccountSettingsProps) {
  const handleExportData = () => {
    alert('Data export feature coming soon!')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon!')
    }
  }

  return (
    <div className="space-y-3">
      {/* General Settings */}
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Settings size={16} className="text-cyan-400" />
        Account Settings
      </h3>

      <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/60 p-4">
        {/* Notifications */}
        <SettingRow>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                {preferences.notificationsEnabled ? (
                  <Bell size={14} className="text-cyan-400" />
                ) : (
                  <BellOff size={14} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Notifications</p>
                <p className="text-[10px] text-gray-500">Workout reminders and achievements</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateNotifications(!preferences.notificationsEnabled)}
              className={`relative inline-flex h-5 w-10 items-center transition-colors ${
                preferences.notificationsEnabled ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <motion.span
                animate={{ x: preferences.notificationsEnabled ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="inline-block h-4 w-4 bg-white"
              />
            </button>
          </div>
        </SettingRow>

        {/* Dark Mode */}
        <SettingRow>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                <Moon size={14} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-[10px] text-gray-500">Always enabled</p>
              </div>
            </div>
            <div className="bg-cyan-500 px-2 py-0.5">
              <span className="text-[10px] text-black font-bold">ON</span>
            </div>
          </div>
        </SettingRow>

        {/* Export Data */}
        <SettingRow>
          <button
            onClick={handleExportData}
            className="flex items-center gap-3 w-full text-gray-400 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-dark-700/60 border border-dark-600/40">
              <Download size={14} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Export Data</p>
              <p className="text-[10px] text-gray-500">Download your workout history</p>
            </div>
          </button>
        </SettingRow>
      </div>

      {/* Danger Zone */}
      <div className="bg-dark-800/60 backdrop-blur-md border border-red-500/10 p-4">
        <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-3 font-medium">Danger Zone</p>
        <SettingRow>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-3 w-full text-gray-500 hover:text-red-400 transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 border border-red-500/20">
              <Trash2 size={14} className="text-red-400/60" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-[10px] text-gray-600">Permanently delete your account and data</p>
            </div>
          </button>
        </SettingRow>
      </div>

      {/* Sign Out */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="bg-dark-800/40 backdrop-blur-md border border-dark-700/40 p-3"
      >
        <Button
          onClick={onSignOut}
          variant="ghost"
          className="w-full justify-center text-gray-400 hover:text-white flex items-center gap-2"
        >
          <LogOut size={16} />
          <span className="text-sm">Sign Out</span>
        </Button>
      </motion.div>
    </div>
  )
}

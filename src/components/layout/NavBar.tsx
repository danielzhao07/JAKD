import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { Home, Dumbbell, Clock, User, Plus } from 'lucide-react'
import { clsx } from 'clsx'

export function NavBar() {
  const navItems = [
    { to: ROUTES.HOME, icon: Home, label: 'Home', isCenterButton: false },
    { to: ROUTES.HISTORY, icon: Clock, label: 'History', isCenterButton: false },
    { to: ROUTES.WORKOUT, icon: Plus, label: '', isCenterButton: true },
    { to: ROUTES.EXERCISES, icon: Dumbbell, label: 'Exercises', isCenterButton: false },
    { to: ROUTES.PROFILE, icon: User, label: 'Profile', isCenterButton: false },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-gray-600 md:relative md:border-t-0 md:border-b z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 md:grid md:grid-cols-[auto_1fr_auto]">
          {/* Logo - only on desktop, positioned left */}
          <div className="hidden md:flex items-center gap-2">
            <img src="/jakd-logo.png" alt="JAKD" className="h-20" style={{ filter: 'invert(1) brightness(2)' }} />
          </div>

          {/* Navigation Items - centered on desktop, spread on mobile */}
          <div className="flex items-center justify-around flex-1 md:justify-center md:gap-1 -translate-y-1">
            {navItems.map(({ to, icon: Icon, label, isCenterButton }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col md:flex-row items-center gap-0.5 md:gap-2 transition-colors',
                    isCenterButton
                      ? 'relative -mt-8 md:mt-0'
                      : 'px-3 py-1.5 rounded-lg text-xs md:text-sm',
                    isCenterButton && isActive
                      ? ''
                      : isCenterButton
                      ? ''
                      : isActive
                      ? 'text-cyan-400'
                      : 'text-gray-400 hover:text-cyan-300 transition-all duration-200'
                  )
                }
              >
                {isCenterButton ? (
                  // Large circular center button with glow
                  <div className={clsx(
                    'flex items-center justify-center rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95',
                    'w-14 h-14 md:w-10 md:h-10',
                    'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400',
                    'shadow-[0_0_20px_rgba(34,211,238,0.5),0_0_40px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6),0_0_50px_rgba(34,211,238,0.3)]'
                  )}>
                    <Icon size={28} className="text-black md:w-5 md:h-5" />
                  </div>
                ) : (
                  <>
                    <Icon size={20} />
                    {label && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop spacing for grid layout symmetry */}
          <div className="hidden md:block w-24"></div>
        </div>
      </div>
    </nav>
  )
}

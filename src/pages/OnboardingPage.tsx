import { useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Target, Flame, Dumbbell, TrendingUp, Zap, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/utils/constants'
import { GridBackground } from '@/components/onboarding/GridBackground'
import { SplitText } from '@/components/onboarding/SplitText'
import { MagneticGlowButton } from '@/components/onboarding/MagneticGlowButton'
import { GlowCard } from '@/components/onboarding/GlowCard'

// ─── Mission Steps ──────────────────────────────────────────────

const TOTAL_STEPS = 3

// Step 0: Welcome
// Step 1: Select your mission (fitness goal)
// Step 2: Select your experience level

const fitnessGoals = [
  {
    id: 'strength',
    label: 'Build Strength',
    desc: 'Lift heavier. Break limits.',
    icon: Dumbbell,
  },
  {
    id: 'muscle',
    label: 'Gain Muscle',
    desc: 'Hypertrophy-focused training.',
    icon: Flame,
  },
  {
    id: 'endurance',
    label: 'Boost Endurance',
    desc: 'Push further. Last longer.',
    icon: TrendingUp,
  },
  {
    id: 'general',
    label: 'Stay Fit',
    desc: 'Overall health & wellness.',
    icon: Shield,
  },
]

const experienceLevels = [
  {
    id: 'beginner',
    label: 'Rookie',
    desc: 'New to the gym or just getting started.',
    tag: '0-6 months',
  },
  {
    id: 'intermediate',
    label: 'Trained',
    desc: 'Consistent training under your belt.',
    tag: '6-24 months',
  },
  {
    id: 'advanced',
    label: 'Veteran',
    desc: 'Years of serious lifting experience.',
    tag: '2+ years',
  },
]

// ─── Animation Variants (no blur filter — expensive on mobile) ──

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

// ─── Component ──────────────────────────────────────────────────

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setHasSeenOnboarding } = useAuthStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  const handleLaunch = () => {
    setHasSeenOnboarding(true)
    navigate('/signup')
  }

  const canProceed = () => {
    if (step === 0) return true
    if (step === 1) return selectedGoal !== null
    if (step === 2) return selectedLevel !== null
    return false
  }

  return (
    <div className="h-[100dvh] bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 z-0">
        <GridBackground />
      </div>

      {/* Ambient glow orbs — static on mobile, animated on desktop */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {isMobile ? (
          <>
            <div
              className="absolute w-[400px] h-[400px] rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)',
                top: '15%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="absolute w-[250px] h-[250px] rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,255,0.05) 0%, transparent 70%)',
                bottom: '10%',
                right: '10%',
              }}
            />
          </>
        ) : (
          <>
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)',
                top: '15%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,255,0.05) 0%, transparent 70%)',
                bottom: '10%',
                right: '10%',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </>
        )}
      </div>

      {/* Top bar: step indicator + back button */}
      <div className="relative z-20 px-6 pt-6 flex items-center justify-between flex-shrink-0">
        {step > 0 ? (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back
          </motion.button>
        ) : (
          <div />
        )}

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1 transition-all duration-500"
              style={{
                width: i <= step ? 32 : 12,
                background: i <= step
                  ? 'linear-gradient(90deg, #00FFFF, #06b6d4)'
                  : 'rgba(255,255,255,0.1)',
                boxShadow: i <= step ? '0 0 8px rgba(0,255,255,0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <span className="text-[11px] text-gray-500 font-mono tabular-nums">
          {String(step + 1).padStart(2, '0')}/{String(TOTAL_STEPS).padStart(2, '0')}
        </span>
      </div>

      {/* Main content with AnimatePresence — scrollable */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <StepWelcome key="welcome" direction={direction} onGetStarted={goNext} />
          )}
          {step === 1 && (
            <StepGoal
              key="goal"
              direction={direction}
              selectedGoal={selectedGoal}
              onSelectGoal={setSelectedGoal}
            />
          )}
          {step === 2 && (
            <StepLevel
              key="level"
              direction={direction}
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation — always visible, pinned at bottom */}
      <div className="relative z-20 px-6 pb-6 pt-3 flex-shrink-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent">
        {step > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MagneticGlowButton
              onClick={step === TOTAL_STEPS - 1 ? handleLaunch : goNext}
              disabled={!canProceed()}
              className="w-full py-3.5 text-base"
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  Launch Mission
                  <Zap size={18} />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={18} />
                </>
              )}
            </MagneticGlowButton>
          </motion.div>
        )}

        {/* Already have account link */}
        <motion.p
          className="text-center mt-3 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account?{' '}
          <button
            onClick={() => {
              setHasSeenOnboarding(true)
              navigate('/login')
            }}
            className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
          >
            Sign In
          </button>
        </motion.p>

        {/* Legal links */}
        <motion.p
          className="text-center text-xs mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to={ROUTES.PRIVACY_POLICY} className="text-gray-400/60 hover:text-cyan-400/80 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-400/40 mx-1.5">·</span>
          <Link to={ROUTES.TERMS_OF_SERVICE} className="text-gray-400/60 hover:text-cyan-400/80 transition-colors">
            Terms of Service
          </Link>
        </motion.p>
      </div>
    </div>
  )
}

// ─── Step 0: Welcome ────────────────────────────────────────────

function StepWelcome({
  direction,
  onGetStarted,
}: {
  direction: number
  onGetStarted: () => void
}) {
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      {/* Logo with pulse glow */}
      <motion.div
        className="mb-8 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full scale-150" />
        <img
          src="/jakd-logo.png"
          alt="JAKD"
          className="h-24 relative z-10 drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]"
          style={{ filter: 'invert(1) brightness(2)' }}
        />
      </motion.div>

      {/* Split text headline */}
      <div className="text-center max-w-md mb-3">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-1">
          <SplitText text="Your Mission" delay={0.2} />
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          <SplitText
            text="Starts Here"
            className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent"
            delay={0.5}
          />
        </h2>
      </div>

      {/* Subtext */}
      <motion.p
        className="text-gray-400 text-base text-center max-w-sm leading-relaxed mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        AI-powered rep tracking. Real-time form analysis.
        Your personal gym intelligence system.
      </motion.p>

      {/* Feature tags */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mt-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {['Rep Detection', 'Form Analysis', 'Progress Tracking'].map((tag) => (
          <motion.span
            key={tag}
            variants={staggerItem}
            className="px-4 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-500/30 bg-cyan-500/5"
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>

      {/* Get started CTA */}
      <motion.div
        className="mt-12 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <MagneticGlowButton onClick={onGetStarted} className="w-full py-4 text-lg">
          Begin Setup
          <ChevronRight size={20} />
        </MagneticGlowButton>
      </motion.div>
    </motion.div>
  )
}

// ─── Step 1: Select Goal ────────────────────────────────────────

function StepGoal({
  direction,
  selectedGoal,
  onSelectGoal,
}: {
  direction: number
  selectedGoal: string | null
  onSelectGoal: (id: string) => void
}) {
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex-1 flex flex-col items-center px-6 pt-6 pb-4"
    >
      {/* Step label */}
      <motion.span
        className="text-[11px] font-mono text-cyan-400/60 tracking-[0.25em] uppercase mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Mission Objective
      </motion.span>

      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
        <SplitText text="Select Your Goal" delay={0.1} staggerDelay={0.025} />
      </h2>

      <motion.p
        className="text-gray-400 text-sm text-center mb-6 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        What are you training for? This helps us tailor your experience.
      </motion.p>

      {/* Goal cards */}
      <motion.div
        className="grid grid-cols-2 gap-3 w-full max-w-md"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {fitnessGoals.map((goal) => {
          const Icon = goal.icon
          return (
            <motion.div key={goal.id} variants={staggerItem}>
              <GlowCard
                selected={selectedGoal === goal.id}
                onClick={() => onSelectGoal(goal.id)}
                className="p-5"
              >
                <div className="flex flex-col gap-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center border transition-colors duration-300 ${
                      selectedGoal === goal.id
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                        : 'border-dark-700 bg-dark-800 text-gray-400'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{goal.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{goal.desc}</p>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

// ─── Step 2: Experience Level ───────────────────────────────────

function StepLevel({
  direction,
  selectedLevel,
  onSelectLevel,
}: {
  direction: number
  selectedLevel: string | null
  onSelectLevel: (id: string) => void
}) {
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex-1 flex flex-col items-center px-6 pt-6 pb-4"
    >
      {/* Step label */}
      <motion.span
        className="text-[11px] font-mono text-cyan-400/60 tracking-[0.25em] uppercase mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Operator Profile
      </motion.span>

      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
        <SplitText text="Your Experience" delay={0.1} staggerDelay={0.025} />
      </h2>

      <motion.p
        className="text-gray-400 text-sm text-center mb-6 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Where are you in your fitness journey?
      </motion.p>

      {/* Level cards */}
      <motion.div
        className="flex flex-col gap-3 w-full max-w-md"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {experienceLevels.map((level) => (
          <motion.div key={level.id} variants={staggerItem}>
            <GlowCard
              selected={selectedLevel === level.id}
              onClick={() => onSelectLevel(level.id)}
              className="p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-white font-semibold">{level.label}</p>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 transition-colors duration-300 ${
                        selectedLevel === level.id
                          ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30'
                          : 'text-gray-500 bg-dark-800 border border-dark-700'
                      }`}
                    >
                      {level.tag}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{level.desc}</p>
                </div>
                <Target
                  size={20}
                  className={`transition-colors duration-300 ${
                    selectedLevel === level.id ? 'text-cyan-400' : 'text-dark-700'
                  }`}
                />
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

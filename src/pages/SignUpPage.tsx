import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ChevronRight, Camera, Brain, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/utils/constants'
import { GridBackground } from '@/components/onboarding/GridBackground'
import { FloatingInput } from '@/components/auth/FloatingInput'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { MagneticGlowButton } from '@/components/onboarding/MagneticGlowButton'
import { SplitText } from '@/components/onboarding/SplitText'

// ─── Animations ─────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

// ─── Feature data ───────────────────────────────────────────────

const features = [
  {
    icon: Camera,
    title: 'Real-time Camera Rep Tracking',
    desc: 'Point your camera and let AI count every rep automatically. No wearables needed.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Form Correction',
    desc: 'Get instant feedback on your form with pose detection that catches mistakes in real time.',
  },
  {
    icon: TrendingUp,
    title: 'Personalized AI Coaching',
    desc: 'Smart analytics that adapt to your progress and help you train smarter every session.',
  },
]

// ─── Google SVG ─────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [shakeField, setShakeField] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError('')

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      setShakeField('confirmPassword')
      setTimeout(() => setShakeField(null), 600)
      return
    }

    await signUp(email, password)
    const { user } = useAuthStore.getState()
    if (user) {
      navigate(ROUTES.HOME)
    }
  }

  const handleGoogleSignIn = async () => {
    clearError()
    await signInWithGoogle()
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#050505]">
      {/* ─── Left: Join Hero Panel ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
        {/* Interactive grid background */}
        <div className="absolute inset-0">
          <GridBackground />
        </div>

        {/* Ambient glow orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)',
            bottom: '15%',
            left: '20%',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-lg px-12">
          {/* Logo */}
          <motion.div
            className="mb-8 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full scale-150" />
            <img
              src="/jakd-logo.png"
              alt="JAKD"
              className="h-16 relative z-10 drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]"
              style={{ filter: 'invert(1) brightness(2)' }}
            />
          </motion.div>

          {/* Headline */}
          <div className="mb-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-2">
              <SplitText text="Train Smarter" delay={0.2} />
            </h1>
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              <SplitText
                text="With AI"
                className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent"
                delay={0.6}
              />
            </h2>
          </div>

          <motion.p
            className="text-gray-400 text-base leading-relaxed mb-10 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            The first gym tracker that sees your workout. AI-powered camera tracking meets real-time coaching.
          </motion.p>

          {/* Feature cards */}
          <div className="space-y-5">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  className="flex gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.15, duration: 0.5 }}
                >
                  {/* Glowing icon */}
                  <div className="flex-shrink-0 w-11 h-11 border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center relative group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10 transition-all duration-300">
                    <Icon size={20} className="text-cyan-400" />
                    {/* Pulse glow on hover */}
                    <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-0.5">{feature.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Social proof line */}
          <motion.div
            className="mt-10 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#050505] bg-dark-700"
                  style={{
                    background: `linear-gradient(135deg, rgba(0,255,255,${0.15 + i * 0.1}), rgba(6,182,212,${0.1 + i * 0.05}))`,
                  }}
                />
              ))}
            </div>
            <p className="text-gray-500 text-xs">
              Join athletes already training with JAKD
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Right: Sign Up Form ────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-8 relative z-10">
        {/* Mobile hero (only on small screens) */}
        <motion.div
          className="lg:hidden text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 relative inline-block">
            <div className="absolute inset-0 blur-xl bg-cyan-500/15 rounded-full scale-150" />
            <img
              src="/jakd-logo.png"
              alt="JAKD"
              className="h-12 relative z-10 drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              style={{ filter: 'invert(1) brightness(2)' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Join JAKD</h1>
          <p className="text-gray-400 text-sm">AI-powered workout tracking</p>
        </motion.div>

        <motion.div
          className="max-w-sm w-full mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Desktop header (hidden on mobile since hero is shown) */}
          <div className="hidden lg:block mb-6">
            <motion.h2
              className="text-xl font-bold text-white mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Create Account
            </motion.h2>
            <motion.p
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Start tracking your workouts today
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {/* Error */}
              {displayError && (
                <motion.div
                  className="bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {displayError}
                </motion.div>
              )}

              {/* Email */}
              <motion.div variants={staggerItem}>
                <FloatingInput
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={staggerItem}>
                <FloatingInput
                  label="Password"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <PasswordStrengthMeter password={password} />
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={staggerItem}>
                <FloatingInput
                  label="Confirm Password"
                  icon={Lock}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  error={shakeField === 'confirmPassword'}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </motion.div>

              {/* Submit */}
              <motion.div variants={staggerItem}>
                <MagneticGlowButton
                  onClick={() => {
                    const form = document.querySelector('form')
                    form?.requestSubmit()
                  }}
                  disabled={isLoading}
                  className="w-full py-3 text-sm"
                >
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Sign Up
                      <ChevronRight size={18} />
                    </>
                  )}
                </MagneticGlowButton>
              </motion.div>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            className="flex items-center gap-3 my-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
              or continue with
            </span>
            <div className="flex-1 h-px bg-dark-700" />
          </motion.div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-dark-900/60 border border-dark-700 py-2.5 text-sm text-white font-medium hover:bg-dark-800 hover:border-dark-600 transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* Sign in link */}
          <motion.p
            className="text-center text-gray-400 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
            >
              Log In
            </Link>
          </motion.p>

          {/* Legal */}
          <motion.p
            className="text-center text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <span className="text-gray-400/50">By signing up, you agree to our </span>
            <Link to={ROUTES.TERMS_OF_SERVICE} className="text-gray-400/60 hover:text-cyan-400/80 transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-400/50"> and </span>
            <Link to={ROUTES.PRIVACY_POLICY} className="text-gray-400/60 hover:text-cyan-400/80 transition-colors">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

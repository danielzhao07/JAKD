import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/utils/constants'
import { ParticleField } from '@/components/auth/ParticleField'
import { FloatingInput } from '@/components/auth/FloatingInput'
import { MagneticGlowButton } from '@/components/onboarding/MagneticGlowButton'

// ─── Animations ─────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 14, filter: 'blur(3px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

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

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setHasError(false)
    await signIn(email, password)
    const state = useAuthStore.getState()
    if (state.user) {
      navigate(ROUTES.HOME)
    } else if (state.error) {
      setHasError(true)
      setTimeout(() => setHasError(false), 600)
    }
  }

  const handleGoogleSignIn = async () => {
    clearError()
    await signInWithGoogle()
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Subtle particle background */}
      <div className="absolute inset-0 z-0">
        <ParticleField opacity={0.25} particleCount={45} speed={0.2} />
      </div>

      {/* Ambient glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-6"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      >
        {/* Card container */}
        <div className="border border-dark-700/50 bg-dark-900/60 backdrop-blur-sm p-8">
          {/* Shimmer edge */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 20px rgba(0,255,255,0.03)' }}
            animate={{
              boxShadow: [
                'inset 0 0 15px rgba(0,255,255,0.02)',
                'inset 0 0 25px rgba(0,255,255,0.06)',
                'inset 0 0 15px rgba(0,255,255,0.02)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Logo + Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="mb-4 inline-block relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute inset-0 blur-xl bg-cyan-500/15 rounded-full scale-150" />
              <img
                src="/jakd-logo.png"
                alt="JAKD"
                className="h-12 relative z-10 drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </motion.div>

            <h1 className="text-xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-gray-400 text-sm">
              Log in to continue your training
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <motion.div variants={staggerItem}>
                <FloatingInput
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={hasError}
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
                  error={hasError}
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
              </motion.div>

              {/* Remember me + Forgot */}
              <motion.div variants={staggerItem} className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`w-3.5 h-3.5 border flex items-center justify-center transition-all duration-300 ${
                      rememberMe
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-dark-600 group-hover:border-dark-500'
                    }`}
                  >
                    {rememberMe && (
                      <motion.svg
                        className="w-2 h-2 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    Remember me
                  </span>
                </button>

                <button
                  type="button"
                  className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors"
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Login button */}
              <motion.div variants={staggerItem}>
                <MagneticGlowButton
                  onClick={() => {
                    const form = document.querySelector('form')
                    form?.requestSubmit()
                  }}
                  disabled={isLoading}
                  className="w-full py-3 text-sm"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="spinner"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        />
                        <span className="text-sm">Logging in...</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        Log In
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                        </svg>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MagneticGlowButton>
              </motion.div>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            className="flex items-center gap-3 my-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
              or
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
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* Sign up link */}
          <motion.p
            className="text-center text-gray-400 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Don't have an account?{' '}
            <Link
              to={ROUTES.SIGNUP}
              className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
            >
              Sign Up
            </Link>
          </motion.p>

          {/* Legal */}
          <motion.p
            className="text-center text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
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
      </motion.div>
    </div>
  )
}

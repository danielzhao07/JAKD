import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/utils/constants'
import Squares from '@/components/reactbits/Squares'
import BlurText from '@/components/reactbits/BlurText'

const slides = [
  {
    title: 'Your All-In-One',
    highlight: 'Gym Trainer',
    description: 'Track every rep, every set, and every workout with precision. Your personal fitness journey starts here.',
  },
  {
    title: 'AI-Powered',
    highlight: 'Rep Detection',
    description: 'Use your camera to automatically count reps with real-time pose detection. No more losing count mid-set.',
  },
  {
    title: 'Set Goals &',
    highlight: 'Crush Them',
    description: 'Track your progress, set personal records, and watch yourself get stronger every day.',
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setHasSeenOnboarding } = useAuthStore()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const handleGetStarted = () => {
    setHasSeenOnboarding(true)
    navigate('/login')
  }

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Animated Squares background */}
      <div className="absolute inset-0 pointer-events-none">
        <Squares
          direction="diagonal"
          speed={0.3}
          borderColor="#1a1a1a"
          hoverFillColor="#111"
          squareSize={48}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/jakd-logo.png"
            alt="JAKD"
            className="h-20 drop-shadow-[0_0_20px_#06b6d4aa]"
            style={{ filter: 'invert(1) brightness(2)' }}
          />
        </div>

        {/* Title and description with BlurText animations */}
        <div className="text-center max-w-md" key={currentSlide}>
          <BlurText
            text={slide.title}
            className="text-3xl md:text-4xl font-bold text-white mb-1 justify-center"
            delay={80}
            animateBy="words"
            direction="top"
            stepDuration={0.3}
          />
          <BlurText
            text={slide.highlight}
            className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4 justify-center"
            delay={80}
            animateBy="words"
            direction="top"
            stepDuration={0.3}
          />
          <BlurText
            text={slide.description}
            className="text-gray-400 text-base leading-relaxed px-4 justify-center"
            delay={30}
            animateBy="words"
            direction="bottom"
            stepDuration={0.25}
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 px-6 pb-8">
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 h-2 bg-cyan-400'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Get Started button */}
        <button
          onClick={handleGetStarted}
          className="w-full py-3.5 bg-cyan-500 text-black font-semibold text-base flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all duration-200 border border-cyan-500 hover:border-cyan-400"
        >
          Get Started
          <ChevronRight size={20} />
        </button>

        {/* Already have account link */}
        <p className="text-center mt-4 text-gray-500 text-sm">
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
        </p>

        {/* Legal links */}
        <p className="text-center text-gray-600 text-xs mt-6">
          <Link to={ROUTES.PRIVACY_POLICY} className="hover:text-gray-400 transition-colors">
            Privacy Policy
          </Link>
          {' · '}
          <Link to={ROUTES.TERMS_OF_SERVICE} className="hover:text-gray-400 transition-colors">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  )
}

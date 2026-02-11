import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Camera, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useExerciseStore } from '@/store/exerciseStore'

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Smith Machine',
  'Bodyweight',
  'Kettlebell',
  'Plate',
  'Resistance Band',
  'Other'
]

const MUSCLE_GROUPS = [
  'Abdominals',
  'Biceps',
  'Calves',
  'Chest',
  'Forearms',
  'Glutes',
  'Hamstrings',
  'Lats',
  'Lower Back',
  'Quadriceps',
  'Shoulders',
  'Triceps',
  'Upper Back',
  'Other'
]

const EXERCISE_TYPES = [
  'Reps',
  'Duration',
  'Distance'
]

export function CreateExercisePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { refetchExercises } = useExerciseStore()
  const returnTo = location.state?.returnTo || '/exercises'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exerciseName, setExerciseName] = useState('')
  const [equipment, setEquipment] = useState('')
  const [primaryMuscle, setPrimaryMuscle] = useState('')
  const [otherMuscles] = useState<string[]>([])
  const [exerciseType, setExerciseType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [showEquipmentSelect, setShowEquipmentSelect] = useState(false)
  const [showPrimaryMuscleSelect, setShowPrimaryMuscleSelect] = useState(false)
  const [showOtherMusclesSelect, setShowOtherMusclesSelect] = useState(false)
  const [showExerciseTypeSelect, setShowExerciseTypeSelect] = useState(false)

  const handlePhotoSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setPhotoFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadPhoto = async (exerciseId: string): Promise<string | null> => {
    if (!photoFile || !user) return null

    const fileExt = photoFile.name.split('.').pop()
    const path = `${user.id}/${exerciseId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('exercise-images')
      .upload(path, photoFile, {
        contentType: photoFile.type,
        upsert: true,
      })

    if (uploadError) {
      console.warn('Photo upload failed:', uploadError.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(path)

    return urlData.publicUrl
  }

  const handleSave = async () => {
    if (!exerciseName.trim()) {
      setError('Exercise name is required')
      return
    }

    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: exerciseName.trim(),
          category: primaryMuscle.toLowerCase() || 'other',
          equipment: equipment.toLowerCase() || 'other',
          detector_type: 'manual',
          created_by: user.id,
          is_custom: true
        })
        .select()
        .single()

      if (insertError) throw insertError

      const exerciseData = data as any

      // Upload photo if selected
      if (photoFile && exerciseData) {
        const thumbnailUrl = await uploadPhoto(exerciseData.id)
        if (thumbnailUrl) {
          await supabase
            .from('exercises')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', exerciseData.id)
        }
      }

      // Refetch exercises so the new one appears immediately
      await refetchExercises()

      // If returning to create routine page, pass the exercise
      if (returnTo.includes('create-routine')) {
        navigate(returnTo, { state: { selectedExercises: [exerciseData] } })
      } else {
        navigate(returnTo)
      }
    } catch (err: any) {
      console.error('Failed to create exercise:', err)
      setError(err?.message || 'Failed to create exercise. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canSave = exerciseName.trim().length > 0

  return (
    <div className="min-h-screen bg-black">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(returnTo)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Create Exercise</h1>
          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            size="sm"
            className="min-w-[70px]"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-dark-700">
        {/* Exercise Image */}
        <div className="px-4 py-8 flex flex-col items-center">
          <div className="relative">
            <button
              onClick={handlePhotoSelect}
              className="w-32 h-32 rounded-full border-2 border-dark-700 flex items-center justify-center hover:border-cyan-500 transition-colors overflow-hidden"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Exercise" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-600" />
              )}
            </button>
            {photoPreview && (
              <button
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            )}
          </div>
          <button
            onClick={handlePhotoSelect}
            className="text-cyan-400 text-sm mt-4"
          >
            {photoPreview ? 'Change Photo' : 'Add Photo'}
          </button>
        </div>

        {/* Exercise Name */}
        <div className="px-4 py-4">
          <label className="block text-gray-400 text-sm mb-2">Exercise Name</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => {
              setExerciseName(e.target.value)
              setError('')
            }}
            placeholder="Enter exercise name"
            className="w-full bg-transparent text-white text-lg border-b border-dark-700 pb-2 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Equipment */}
        <button
          onClick={() => setShowEquipmentSelect(!showEquipmentSelect)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-dark-800 transition-colors"
        >
          <div className="text-left">
            <p className="text-white text-sm mb-1">Equipment</p>
            <p className="text-cyan-400 text-sm">{equipment || 'Select'}</p>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </button>

        {showEquipmentSelect && (
          <div className="bg-dark-800">
            {EQUIPMENT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setEquipment(option)
                  setShowEquipmentSelect(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-dark-700 transition-colors"
              >
                <span className={equipment === option ? 'text-cyan-400' : 'text-white'}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Primary Muscle Group */}
        <button
          onClick={() => setShowPrimaryMuscleSelect(!showPrimaryMuscleSelect)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-dark-800 transition-colors"
        >
          <div className="text-left">
            <p className="text-white text-sm mb-1">Primary Muscle Group</p>
            <p className="text-cyan-400 text-sm">{primaryMuscle || 'Select'}</p>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </button>

        {showPrimaryMuscleSelect && (
          <div className="bg-dark-800">
            {MUSCLE_GROUPS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setPrimaryMuscle(option)
                  setShowPrimaryMuscleSelect(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-dark-700 transition-colors"
              >
                <span className={primaryMuscle === option ? 'text-cyan-400' : 'text-white'}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Other Muscles */}
        <button
          onClick={() => setShowOtherMusclesSelect(!showOtherMusclesSelect)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-dark-800 transition-colors"
        >
          <div className="text-left">
            <p className="text-white text-sm mb-1">Other Muscles</p>
            <p className="text-cyan-400 text-sm">
              {otherMuscles.length > 0 ? otherMuscles.join(', ') : 'Select (optional)'}
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </button>

        {/* Exercise Type */}
        <button
          onClick={() => setShowExerciseTypeSelect(!showExerciseTypeSelect)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-dark-800 transition-colors"
        >
          <div className="text-left">
            <p className="text-white text-sm mb-1">Exercise Type</p>
            <p className="text-cyan-400 text-sm">{exerciseType || 'Select'}</p>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </button>

        {showExerciseTypeSelect && (
          <div className="bg-dark-800">
            {EXERCISE_TYPES.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setExerciseType(option)
                  setShowExerciseTypeSelect(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-dark-700 transition-colors"
              >
                <span className={exerciseType === option ? 'text-cyan-400' : 'text-white'}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Grid3X3, MoreHorizontal, Dumbbell, Circle, Bookmark, Video } from 'lucide-react'
import { useHistoryStore } from '@/store/historyStore'
import { useExerciseStore } from '@/store/exerciseStore'
import { ROUTES } from '@/utils/constants'
import type { Exercise } from '@/types/exercise'

// ─── Shared exercise library data ─────────────────────────────────
// These mirror ExercisesPage SAMPLE_EXERCISES exactly so the widget
// has the full 85-exercise catalogue.

interface LibraryExercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  hasVideoDetection?: boolean
}

const SAMPLE_EXERCISES: LibraryExercise[] = [
  { id: '1', name: 'Bench Press (Barbell)', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: '2', name: 'Bicep Curl (Dumbbell)', muscleGroup: 'Biceps', equipment: 'Dumbbell', hasVideoDetection: true },
  { id: '3', name: 'Deadlift (Barbell)', muscleGroup: 'Glutes', equipment: 'Barbell' },
  { id: '4', name: 'Incline Bench Press (Dumbbell)', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { id: '5', name: '21s Bicep Curl', muscleGroup: 'Biceps', equipment: 'Barbell', hasVideoDetection: true },
  { id: '6', name: 'Ab Scissors', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '7', name: 'Ab Wheel', muscleGroup: 'Abdominals', equipment: 'Other' },
  { id: '8', name: 'Arnold Press (Dumbbell)', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { id: '9', name: 'Back Extension', muscleGroup: 'Lower Back', equipment: 'Bodyweight' },
  { id: '10', name: 'Back Extension (Machine)', muscleGroup: 'Lower Back', equipment: 'Machine' },
  { id: '11', name: 'Ball Slams', muscleGroup: 'Full Body', equipment: 'Other' },
  { id: '12', name: 'Barbell Row', muscleGroup: 'Upper Back', equipment: 'Barbell' },
  { id: '13', name: 'Bench Press (Smith Machine)', muscleGroup: 'Chest', equipment: 'Smith Machine' },
  { id: '14', name: 'Box Jump', muscleGroup: 'Quadriceps', equipment: 'Bodyweight' },
  { id: '15', name: 'Bulgarian Split Squat', muscleGroup: 'Quadriceps', equipment: 'Dumbbell' },
  { id: '16', name: 'Cable Crossover', muscleGroup: 'Chest', equipment: 'Cable' },
  { id: '17', name: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable' },
  { id: '18', name: 'Calf Raise (Machine)', muscleGroup: 'Calves', equipment: 'Machine' },
  { id: '19', name: 'Calf Raise (Smith Machine)', muscleGroup: 'Calves', equipment: 'Smith Machine' },
  { id: '20', name: 'Chest Press (Machine)', muscleGroup: 'Chest', equipment: 'Machine' },
  { id: '21', name: 'Chin Up', muscleGroup: 'Lats', equipment: 'Bodyweight' },
  { id: '22', name: 'Clean', muscleGroup: 'Full Body', equipment: 'Barbell' },
  { id: '23', name: 'Clean and Jerk', muscleGroup: 'Full Body', equipment: 'Barbell' },
  { id: '24', name: 'Concentration Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', hasVideoDetection: true },
  { id: '25', name: 'Crunch', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '26', name: 'Deadlift (Smith Machine)', muscleGroup: 'Glutes', equipment: 'Smith Machine' },
  { id: '27', name: 'Decline Bench Press (Barbell)', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: '28', name: 'Decline Bench Press (Smith Machine)', muscleGroup: 'Chest', equipment: 'Smith Machine' },
  { id: '29', name: 'Dip', muscleGroup: 'Triceps', equipment: 'Bodyweight' },
  { id: '30', name: 'Dumbbell Fly', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { id: '31', name: 'Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { id: '32', name: 'Face Pull', muscleGroup: 'Shoulders', equipment: 'Cable' },
  { id: '33', name: 'Front Raise (Dumbbell)', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { id: '34', name: 'Front Raise (Cable)', muscleGroup: 'Shoulders', equipment: 'Cable' },
  { id: '35', name: 'Goblet Squat', muscleGroup: 'Quadriceps', equipment: 'Dumbbell' },
  { id: '36', name: 'Good Morning', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { id: '37', name: 'Hack Squat (Machine)', muscleGroup: 'Quadriceps', equipment: 'Machine' },
  { id: '38', name: 'Hammer Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', hasVideoDetection: true },
  { id: '39', name: 'Hanging Leg Raise', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '40', name: 'Hip Thrust (Barbell)', muscleGroup: 'Glutes', equipment: 'Barbell' },
  { id: '41', name: 'Hip Thrust (Smith Machine)', muscleGroup: 'Glutes', equipment: 'Smith Machine' },
  { id: '42', name: 'Incline Bench Press (Barbell)', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: '43', name: 'Incline Bench Press (Smith Machine)', muscleGroup: 'Chest', equipment: 'Smith Machine' },
  { id: '44', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', hasVideoDetection: true },
  { id: '45', name: 'Kettlebell Swing', muscleGroup: 'Full Body', equipment: 'Kettlebell' },
  { id: '46', name: 'Lat Pulldown', muscleGroup: 'Lats', equipment: 'Cable' },
  { id: '47', name: 'Lateral Raise (Dumbbell)', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { id: '48', name: 'Lateral Raise (Cable)', muscleGroup: 'Shoulders', equipment: 'Cable' },
  { id: '49', name: 'Leg Curl (Machine)', muscleGroup: 'Hamstrings', equipment: 'Machine' },
  { id: '50', name: 'Leg Extension (Machine)', muscleGroup: 'Quadriceps', equipment: 'Machine' },
  { id: '51', name: 'Leg Press (Machine)', muscleGroup: 'Quadriceps', equipment: 'Machine' },
  { id: '52', name: 'Lunge', muscleGroup: 'Quadriceps', equipment: 'Bodyweight' },
  { id: '53', name: 'Lunge (Smith Machine)', muscleGroup: 'Quadriceps', equipment: 'Smith Machine' },
  { id: '54', name: 'Mountain Climbers', muscleGroup: 'Cardio', equipment: 'Bodyweight' },
  { id: '55', name: 'Overhead Press (Barbell)', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { id: '56', name: 'Overhead Press (Smith Machine)', muscleGroup: 'Shoulders', equipment: 'Smith Machine' },
  { id: '57', name: 'Pendlay Row', muscleGroup: 'Upper Back', equipment: 'Barbell' },
  { id: '58', name: 'Plank', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '59', name: 'Preacher Curl (Machine)', muscleGroup: 'Biceps', equipment: 'Machine' },
  { id: '60', name: 'Pull Up', muscleGroup: 'Lats', equipment: 'Bodyweight' },
  { id: '61', name: 'Push Up', muscleGroup: 'Chest', equipment: 'Bodyweight', hasVideoDetection: true },
  { id: '62', name: 'Romanian Deadlift (Barbell)', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { id: '63', name: 'Romanian Deadlift (Smith Machine)', muscleGroup: 'Hamstrings', equipment: 'Smith Machine' },
  { id: '64', name: 'Rowing Machine', muscleGroup: 'Cardio', equipment: 'Machine' },
  { id: '65', name: 'Russian Twist', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '66', name: 'Seated Row (Cable)', muscleGroup: 'Upper Back', equipment: 'Cable' },
  { id: '67', name: 'Shoulder Press (Machine)', muscleGroup: 'Shoulders', equipment: 'Machine' },
  { id: '68', name: 'Shrug (Dumbbell)', muscleGroup: 'Traps', equipment: 'Dumbbell' },
  { id: '69', name: 'Shrug (Smith Machine)', muscleGroup: 'Traps', equipment: 'Smith Machine' },
  { id: '70', name: 'Side Plank', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '71', name: 'Sit Up', muscleGroup: 'Abdominals', equipment: 'Bodyweight' },
  { id: '72', name: 'Skull Crusher', muscleGroup: 'Triceps', equipment: 'Barbell' },
  { id: '73', name: 'Snatch', muscleGroup: 'Full Body', equipment: 'Barbell' },
  { id: '74', name: 'Squat (Barbell)', muscleGroup: 'Quadriceps', equipment: 'Barbell', hasVideoDetection: true },
  { id: '75', name: 'Squat (Smith Machine)', muscleGroup: 'Quadriceps', equipment: 'Smith Machine', hasVideoDetection: true },
  { id: '76', name: 'Step Up', muscleGroup: 'Quadriceps', equipment: 'Bodyweight' },
  { id: '77', name: 'Tricep Dip', muscleGroup: 'Triceps', equipment: 'Bodyweight' },
  { id: '78', name: 'Tricep Extension (Cable)', muscleGroup: 'Triceps', equipment: 'Cable' },
  { id: '79', name: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Cable' },
  { id: '80', name: 'Upright Row (Barbell)', muscleGroup: 'Traps', equipment: 'Barbell' },
  { id: '81', name: 'Upright Row (Smith Machine)', muscleGroup: 'Traps', equipment: 'Smith Machine' },
  { id: '82', name: 'Walking Lunge', muscleGroup: 'Quadriceps', equipment: 'Bodyweight' },
  { id: '83', name: 'Wall Sit', muscleGroup: 'Quadriceps', equipment: 'Bodyweight' },
  { id: '84', name: 'Seated Leg Press (Machine)', muscleGroup: 'Quadriceps', equipment: 'Machine' },
  { id: '85', name: 'Chest Fly (Pec Deck)', muscleGroup: 'Chest', equipment: 'Machine' },
]

// ─── Filter constants ────────────────────────────────────────────
const EQUIPMENT_TYPES = [
  'All Equipment', 'Barbell', 'Dumbbell', 'Machine', 'Cable',
  'Smith Machine', 'Bodyweight', 'Kettlebell', 'Plate', 'Resistance Band', 'Other',
] as const

const MUSCLE_GROUPS = [
  'All Muscles', 'Abdominals', 'Abductors', 'Adductors', 'Biceps', 'Calves',
  'Cardio', 'Chest', 'Forearms', 'Full Body', 'Glutes', 'Hamstrings',
  'Lats', 'Lower Back', 'Neck', 'Quadriceps', 'Shoulders', 'Traps',
  'Triceps', 'Upper Back', 'Other',
] as const

type Equipment = typeof EQUIPMENT_TYPES[number]
type MuscleGroup = typeof MUSCLE_GROUPS[number]

// ─── Muscle image helpers (wger.de) ──────────────────────────────
const MUSCLE_IMAGE_IDS: Record<string, number> = {
  'Abdominals': 6, 'Abductors': 10, 'Adductors': 11, 'Biceps': 1,
  'Calves': 7, 'Chest': 4, 'Forearms': 13, 'Glutes': 8, 'Hamstrings': 11,
  'Lats': 12, 'Lower Back': 9, 'Quadriceps': 10, 'Shoulders': 2,
  'Traps': 9, 'Triceps': 5, 'Upper Back': 12, 'Neck': 9,
}

function getMuscleImageUrl(muscleGroup: string): string | null {
  const muscleId = MUSCLE_IMAGE_IDS[muscleGroup]
  return muscleId ? `https://wger.de/static/images/muscles/main/muscle-${muscleId}.svg` : null
}

// ─── Icon components ─────────────────────────────────────────────
function EquipmentIcon({ equipment, size = 32 }: { equipment: string; size?: number }) {
  const iconClass = 'text-gray-700'
  switch (equipment) {
    case 'Barbell':
      return (<svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={iconClass}><rect x="2" y="23" width="44" height="2" fill="currentColor"/><rect x="6" y="21" width="2" height="6" fill="currentColor"/><rect x="8" y="16" width="3" height="16" fill="currentColor"/><rect x="12" y="18" width="3" height="12" fill="currentColor"/><rect x="40" y="21" width="2" height="6" fill="currentColor"/><rect x="37" y="16" width="3" height="16" fill="currentColor"/><rect x="33" y="18" width="3" height="12" fill="currentColor"/></svg>)
    case 'Dumbbell': return <Dumbbell size={size} className={iconClass} />
    case 'Bodyweight':
      return (<svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={iconClass}><circle cx="24" cy="10" r="6" fill="currentColor"/><path d="M24 18 L24 32 M16 24 L32 24 M24 32 L18 44 M24 32 L30 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>)
    default: return <MoreHorizontal size={size} className={iconClass} />
  }
}

function MuscleIcon({ muscleGroup, size = 48 }: { muscleGroup: string; size?: number }) {
  if (muscleGroup === 'All Muscles') return <Grid3X3 size={size * 0.5} className="text-gray-700" />
  if (muscleGroup === 'Other') return <MoreHorizontal size={size * 0.5} className="text-gray-500" />
  if (muscleGroup === 'Cardio' || muscleGroup === 'Full Body') {
    return (<svg width={size} height={size} viewBox="0 0 48 48" fill="none"><circle cx="24" cy="10" r="6" fill="#666"/><path d="M24 18 L24 30 M16 22 L32 22 M24 30 L18 42 M24 30 L30 42" stroke="#666" strokeWidth="3" strokeLinecap="round"/></svg>)
  }
  const imageUrl = getMuscleImageUrl(muscleGroup)
  if (imageUrl) return <img src={imageUrl} alt={muscleGroup} className="object-contain" style={{ width: size, height: size }} />
  return <Circle size={size * 0.5} className="text-gray-400" />
}

// ─── Filter bottom-sheet ─────────────────────────────────────────
function FilterModal({
  isOpen, onClose, title, options, selected, onSelect, filterType,
}: {
  isOpen: boolean; onClose: () => void; title: string
  options: readonly string[]; selected: string; onSelect: (option: string) => void
  filterType: 'muscle' | 'equipment'
}) {
  if (!isOpen) return null

  const renderIcon = (option: string) => {
    if (filterType === 'muscle') return <MuscleIcon muscleGroup={option} size={48} />
    if (option === 'All Equipment') return <Grid3X3 size={24} className="text-gray-700" />
    if (option === 'Other') return <MoreHorizontal size={24} className="text-gray-500" />
    return <EquipmentIcon equipment={option} size={32} />
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-dark-800 rounded-t-2xl z-[61] max-h-[70vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-600 rounded-full" /></div>
        <h2 className="text-white text-center text-lg font-semibold pb-3">{title}</h2>
        <div className="overflow-y-auto flex-1 pb-8">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onSelect(option); onClose() }}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-dark-700 transition-colors border-t border-dark-700"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                {renderIcon(option)}
              </div>
              <span className="text-white text-[17px] flex-1 text-left">{option}</span>
              {selected === option && (
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Types ────────────────────────────────────────────────────────
/** Unified row data for display */
interface DisplayExercise {
  id: string
  name: string
  category: string       // e.g. "Chest", "Biceps"
  equipment: string
  hasAiTracking: boolean
  isCustom: boolean
  /** The underlying Exercise object when it exists in Supabase */
  dbExercise?: Exercise
}

interface ExerciseExplorerWidgetProps {
  onSelect: (exercise: Exercise) => void
  mode?: 'modal' | 'page'
  showCreateButton?: boolean
}

// ─── Main Widget ─────────────────────────────────────────────────
export function ExerciseExplorerWidget({ onSelect, mode = 'modal', showCreateButton = true }: ExerciseExplorerWidgetProps) {
  const navigate = useNavigate()
  const { exercises: dbExercises, fetchExercises } = useExerciseStore()
  const { workouts, loadWorkouts } = useHistoryStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>('All Equipment')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('All Muscles')
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(false)
  const [hideRecentExercises, setHideRecentExercises] = useState(false)
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false)
  const [muscleModalOpen, setMuscleModalOpen] = useState(false)

  useEffect(() => { loadWorkouts(); fetchExercises() }, [loadWorkouts, fetchExercises])

  // ── Merge DB exercises with SAMPLE_EXERCISES ──────────────────
  // DB exercises always win when they share a name with a sample.
  const mergedExercises = useMemo((): DisplayExercise[] => {
    const dbByName = new Map<string, Exercise>()
    for (const ex of dbExercises) {
      dbByName.set(ex.name.toLowerCase(), ex)
    }

    const result: DisplayExercise[] = []
    const seenNames = new Set<string>()

    // 1. All DB exercises first
    for (const ex of dbExercises) {
      const key = ex.name.toLowerCase()
      if (seenNames.has(key)) continue
      seenNames.add(key)

      const detectorType = ex.detectorType || ''
      const hasAi = ['squat', 'bicep-curl', 'alternating-bicep-curl', 'pushup'].includes(detectorType)

      result.push({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        equipment: ex.equipment || '',
        hasAiTracking: hasAi,
        isCustom: !!ex.isCustom,
        dbExercise: ex,
      })
    }

    // 2. SAMPLE_EXERCISES that aren't already covered by DB
    for (const sample of SAMPLE_EXERCISES) {
      const key = sample.name.toLowerCase()
      if (seenNames.has(key)) continue
      seenNames.add(key)

      result.push({
        id: sample.id,
        name: sample.name,
        category: sample.muscleGroup,
        equipment: sample.equipment,
        hasAiTracking: !!sample.hasVideoDetection,
        isCustom: false,
      })
    }

    return result
  }, [dbExercises])

  // ── Recent exercise IDs ──────────────────────────────────────
  const recentExerciseIds = useMemo(() => {
    const sorted = [...workouts].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const seen = new Set<string>()
    const ids: string[] = []
    for (const w of sorted) {
      if (!seen.has(w.exerciseId) && ids.length < 5) {
        seen.add(w.exerciseId)
        ids.push(w.exerciseId)
      }
    }
    return ids
  }, [workouts])

  // ── Filtering ─────────────────────────────────────────────────
  const filteredExercises = useMemo(() => {
    let list = [...mergedExercises]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q)
      )
    }
    if (selectedEquipment !== 'All Equipment') {
      list = list.filter(e => e.equipment === selectedEquipment)
    }
    if (selectedMuscle !== 'All Muscles') {
      list = list.filter(e => e.category.toLowerCase() === selectedMuscle.toLowerCase())
    }
    if (aiDetectionEnabled) {
      list = list.filter(e => e.hasAiTracking)
    }
    return list
  }, [mergedExercises, searchQuery, selectedEquipment, selectedMuscle, aiDetectionEnabled])

  const hasActiveFilters = selectedEquipment !== 'All Equipment' || selectedMuscle !== 'All Muscles' || aiDetectionEnabled

  const recentExercises = useMemo(() => {
    if (hideRecentExercises || hasActiveFilters) return []
    return recentExerciseIds
      .map(id => filteredExercises.find(e => e.id === id))
      .filter((e): e is DisplayExercise => e !== undefined)
  }, [recentExerciseIds, filteredExercises, hideRecentExercises, hasActiveFilters])

  const customExercisesFiltered = filteredExercises
    .filter(e => e.isCustom && !recentExercises.some(r => r.id === e.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const allExercisesFiltered = filteredExercises
    .filter(e => !e.isCustom && !recentExercises.some(r => r.id === e.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  // ── Selection handler ─────────────────────────────────────────
  // When the user picks an exercise, we either pass the DB Exercise
  // object (if it exists) or construct a minimal one from sample data.
  const handleSelect = (item: DisplayExercise) => {
    if (item.dbExercise) {
      onSelect(item.dbExercise)
    } else {
      // Build a minimal Exercise object from sample data
      const exercise: Exercise = {
        id: item.id,
        name: item.name,
        category: 'upper-body',       // fallback — not critical for selection
        description: '',
        thumbnailUrl: null,
        detectorType: 'squat',        // fallback — gets overridden by workout store
        createdAt: new Date().toISOString(),
        equipment: item.equipment,
      }
      onSelect(exercise)
    }
  }

  // ── Render helpers ────────────────────────────────────────────
  const renderItem = (item: DisplayExercise) => (
    <button
      key={item.id}
      onClick={() => handleSelect(item)}
      className="w-full flex items-center gap-3 py-3 border-b border-dark-700 hover:bg-dark-700/30 transition-colors px-1 text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0">
        <span className="text-cyan-400 text-sm font-bold">{item.name.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-[15px] font-medium truncate">{item.name}</h3>
          {item.hasAiTracking && (
            <Video size={14} className="text-cyan-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-gray-500 text-[14px]">{item.category}</p>
      </div>
    </button>
  )

  return (
    <div className={`flex flex-col ${mode === 'modal' ? 'h-full min-h-0 overflow-hidden' : 'min-h-screen'}`}>
      {/* ── Header / Search / Filters ────────────────────────── */}
      <div className={`flex-shrink-0 ${mode === 'modal' ? 'p-4' : 'sticky top-0 z-20 bg-dark-900 pt-4 pb-3 px-4'}`}>
        {showCreateButton && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-[17px] font-semibold">Add Exercise</h2>
            <button onClick={() => navigate(ROUTES.EXERCISES_CREATE)} className="text-cyan-400 text-[17px] font-medium">
              Create
            </button>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search exercise"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-700 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-10 text-[16px] focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEquipmentModalOpen(true)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              selectedEquipment !== 'All Equipment' ? 'bg-cyan-600 text-white' : 'bg-dark-700 text-gray-300'
            }`}
          >
            <span className="truncate">{selectedEquipment === 'All Equipment' ? 'Equipment' : selectedEquipment}</span>
            {selectedEquipment !== 'All Equipment' && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedEquipment('All Equipment') }} className="ml-0.5 hover:bg-cyan-700 rounded-full p-0.5">
                <X size={14} />
              </button>
            )}
          </button>
          <button
            onClick={() => setMuscleModalOpen(true)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              selectedMuscle !== 'All Muscles' ? 'bg-cyan-600 text-white' : 'bg-dark-700 text-gray-300'
            }`}
          >
            <span className="truncate">{selectedMuscle === 'All Muscles' ? 'Muscles' : selectedMuscle}</span>
            {selectedMuscle !== 'All Muscles' && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedMuscle('All Muscles') }} className="ml-0.5 hover:bg-cyan-700 rounded-full p-0.5">
                <X size={14} />
              </button>
            )}
          </button>
          <button
            onClick={() => setAiDetectionEnabled(!aiDetectionEnabled)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              aiDetectionEnabled ? 'bg-cyan-600 text-white' : 'bg-dark-700 text-gray-300'
            }`}
          >
            <Video size={14} />
            <span>AI</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable exercise list ─────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {/* Recent */}
        {recentExercises.length > 0 && (
          <div className="mb-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-gray-500 text-[14px] font-medium">Recent Exercises</h2>
              <button onClick={() => setHideRecentExercises(true)} className="text-gray-500 hover:text-gray-400 p-1">
                <X size={16} />
              </button>
            </div>
            {recentExercises.map(renderItem)}
          </div>
        )}

        {/* User-created (custom) */}
        {customExercisesFiltered.length > 0 && (
          <div className="mb-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark size={14} className="text-cyan-400" />
              <h2 className="text-gray-500 text-[14px] font-medium">Saved Exercises</h2>
            </div>
            {customExercisesFiltered.map(renderItem)}
          </div>
        )}

        {/* All exercises */}
        <div className="mt-2">
          <h2 className="text-gray-500 text-[14px] font-medium mb-2">All Exercises</h2>
          {allExercisesFiltered.length > 0 ? (
            allExercisesFiltered.map(renderItem)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No exercises found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter modals ────────────────────────────────────── */}
      <FilterModal
        isOpen={equipmentModalOpen}
        onClose={() => setEquipmentModalOpen(false)}
        title="Equipment"
        options={EQUIPMENT_TYPES}
        selected={selectedEquipment}
        onSelect={(o) => setSelectedEquipment(o as Equipment)}
        filterType="equipment"
      />
      <FilterModal
        isOpen={muscleModalOpen}
        onClose={() => setMuscleModalOpen(false)}
        title="Muscle Group"
        options={MUSCLE_GROUPS}
        selected={selectedMuscle}
        onSelect={(o) => setSelectedMuscle(o as MuscleGroup)}
        filterType="muscle"
      />
    </div>
  )
}

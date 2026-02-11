import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { ExerciseExplorerWidget } from '@/components/shared/ExerciseExplorerWidget'
import type { Exercise } from '@/types/exercise'

export function AddExercisesToRoutinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo || '/workout/create-routine'
  const currentExercises = location.state?.currentExercises || []
  const preservedExercises = location.state?.preservedExercises || []
  const routineName = location.state?.routineName || ''
  const routineNotes = location.state?.routineNotes || ''
  const editingRoutineId = location.state?.editingRoutineId || null

  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])

  const handleAddExercises = () => {
    navigate(returnTo, {
      state: {
        selectedExercises,
        preservedExercises,
        routineName,
        routineNotes,
        editingRoutineId
      }
    })
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(returnTo, {
              state: {
                preservedExercises,
                routineName,
                routineNotes,
                editingRoutineId
              }
            })}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Add Exercises</h1>
          {selectedExercises.length > 0 && (
            <button
              onClick={handleAddExercises}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Add ({selectedExercises.length})
            </button>
          )}
        </div>
      </div>

      {/* Exercise Explorer Widget */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ExerciseExplorerWidget
          onSelect={(exercise) => {
            // Check if already in routine
            if (currentExercises.includes(exercise.id)) return

            // Toggle selection
            setSelectedExercises(prev => {
              const isSelected = prev.some(e => e.id === exercise.id)
              if (isSelected) {
                return prev.filter(e => e.id !== exercise.id)
              } else {
                return [...prev, exercise]
              }
            })
          }}
          mode="page"
          showCreateButton
        />
      </div>

      {/* Floating Add Button */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
          <Button
            onClick={handleAddExercises}
            className="w-full shadow-2xl shadow-cyan-500/20"
          >
            Add {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}

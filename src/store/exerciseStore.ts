import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Exercise, ExerciseCategory, ExerciseDetectorType } from '@/types/exercise'

interface ExerciseState {
  exercises: Exercise[]
  isLoading: boolean
  error: string | null
  _cachedForUserId: string | null

  // Actions
  fetchExercises: () => Promise<void>
  refetchExercises: () => Promise<void>
  deleteExercise: (exerciseId: string) => Promise<void>
  clearExercises: () => void
}

// Map database row to Exercise type
function mapDbExercise(row: {
  id: string
  name: string
  category: string
  description: string | null
  thumbnail_url: string | null
  detector_type: string
  created_at: string
  is_custom?: boolean
  equipment?: string
  created_by?: string | null
}): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ExerciseCategory,
    description: row.description || '',
    thumbnailUrl: row.thumbnail_url,
    detectorType: row.detector_type as ExerciseDetectorType,
    createdAt: row.created_at,
    isCustom: row.is_custom || false,
    equipment: row.equipment || undefined,
    createdBy: row.created_by || null,
  }
}

async function fetchUserExercises(): Promise<Exercise[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch non-custom exercises (global) + custom exercises belonging to this user
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .or(user ? `is_custom.eq.false,created_by.eq.${user.id}` : 'is_custom.eq.false')
    .order('name')

  if (error) throw error

  return (data || []).map((row: any) => mapDbExercise(row))
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  isLoading: false,
  error: null,
  _cachedForUserId: null,

  fetchExercises: async () => {
    // Check if cached exercises belong to the current user
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id || null
    const state = get()

    // Don't fetch if we already have exercises for the same user
    if (state.exercises.length > 0 && state._cachedForUserId === currentUserId) return

    set({ isLoading: true, error: null })

    try {
      const exercises = await fetchUserExercises()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      set({ exercises, isLoading: false, _cachedForUserId: currentUser?.id || null })
    } catch (error) {
      console.error('Failed to load exercises:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load exercises',
        isLoading: false
      })
    }
  },

  refetchExercises: async () => {
    set({ isLoading: true, error: null })

    try {
      const exercises = await fetchUserExercises()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      set({ exercises, isLoading: false, _cachedForUserId: currentUser?.id || null })
    } catch (error) {
      console.error('Failed to load exercises:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load exercises',
        isLoading: false
      })
    }
  },

  deleteExercise: async (exerciseId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Only allow deleting custom exercises that belong to the current user
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('created_by', user.id)
      .eq('is_custom', true)

    if (error) throw error

    // Remove from local state
    set({ exercises: get().exercises.filter(e => e.id !== exerciseId) })
  },

  clearExercises: () => {
    set({ exercises: [], _cachedForUserId: null })
  },
}))

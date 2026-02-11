import { X } from 'lucide-react'
import { Button } from './Button'

export type BicepCurlVariant = 'alternating' | 'two-arms'

interface BicepCurlVariantModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (variant: BicepCurlVariant) => void
  exerciseName: string
}

export function BicepCurlVariantModal({ isOpen, onClose, onSelect, exerciseName }: BicepCurlVariantModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-dark-900 rounded-2xl w-full max-w-md p-6 border border-dark-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Choose Variation</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-400 mb-6">
          {exerciseName} can be tracked with AI. Which variation would you like to perform?
        </p>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={() => onSelect('alternating')}
            className="w-full p-4 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-600 hover:border-cyan-500/50 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-900/50 transition-colors">
                <span className="text-cyan-400 text-xl font-bold">A</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Alternating</h4>
                <p className="text-gray-400 text-sm">Curl one arm at a time. Each arm counted separately.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('two-arms')}
            className="w-full p-4 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-600 hover:border-cyan-500/50 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-900/50 transition-colors">
                <span className="text-cyan-400 text-xl font-bold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Two Arms (Simultaneous)</h4>
                <p className="text-gray-400 text-sm">Curl both arms together. Rep counted when both complete.</p>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full mt-4"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

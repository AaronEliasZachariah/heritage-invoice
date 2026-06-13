import { useRef, useState } from 'react'
import Stepper from './Stepper.jsx'
import AiPrompt from './AiPrompt.jsx'
import DetailsStep from './DetailsStep.jsx'
import ClientStep from './ClientStep.jsx'
import ItemsStep from './ItemsStep.jsx'
import ReviewStep from './ReviewStep.jsx'
import { ArrowLeftIcon, ArrowRightIcon } from '../ui/Icons.jsx'

const STEPS = [
  { key: 'details', label: 'Your details', Component: DetailsStep },
  { key: 'client', label: 'Client', Component: ClientStep },
  { key: 'items', label: 'Items', Component: ItemsStep },
  { key: 'review', label: 'Review & export', Component: ReviewStep },
]

export default function Wizard() {
  const [step, setStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const topRef = useRef(null)

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, i))
    setStep(clamped)
    setMaxReached((m) => Math.max(m, clamped))
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { Component } = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="space-y-5">
      <AiPrompt onApplied={() => goTo(Math.max(step, 1))} />

      <div className="card" ref={topRef}>
        <Stepper steps={STEPS} current={step} maxReached={maxReached} onSelect={goTo} />

        <div className="mt-7 animate-fade-in-up" key={step}>
          <Component />
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-heritage-sand/70 pt-5">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="btn-ghost"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>

          {!isLast ? (
            <button type="button" onClick={() => goTo(step + 1)} className="btn-primary">
              Continue <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-xs text-heritage-brownLight">Export below ↓</span>
          )}
        </div>
      </div>
    </div>
  )
}

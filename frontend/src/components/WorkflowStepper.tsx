'use client'
import { useState } from 'react'
import Link from 'next/link'

interface WorkflowStepperProps {
  currentStep: 'review' | 'production' | 'packing' | 'tracking'
  orderStatus: string
  orderId: string
}

const STEPS = [
  { key: 'review', label: 'Review', path: 'review' },
  { key: 'production', label: 'Production', path: 'production' },
  { key: 'packing', label: 'Packing', path: 'packing' },
  { key: 'tracking', label: 'Tracking', path: 'tracking' }
]

const getStatusIndex = (status: string) => {
  const s = status.toLowerCase()
  if (s === 'review') return 0
  if (s === 'production') return 1
  if (s === 'packing') return 2
  if (s === 'tracking' || s === 'completed' || s === 'shipped' || s === 'delivered') return 3
  return 0
}

export default function WorkflowStepper({ currentStep, orderStatus, orderId }: WorkflowStepperProps) {
  const dbStatusIndex = getStatusIndex(orderStatus)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const handleStepClick = (e: React.MouseEvent, stepLabel: string, stepIndex: number) => {
    if (stepIndex > dbStatusIndex) {
      e.preventDefault()
      setAlertMessage(`Langkah "${stepLabel}" belum dapat diakses. Silakan selesaikan tahapan sebelumnya sesuai urutan workflow.`)
    }
  }

  return (
    <>
      <div className="w-full bg-bg-card border border-border-main rounded-card p-3.5 md:p-5 mb-6 md:mb-8 shadow-sm transition-colors duration-300">
        <div className="relative flex flex-row justify-between items-center gap-1 md:gap-4">
          
          {/* Progress Line */}
          <div className="absolute top-[16px] md:top-[22px] left-[10%] right-[10%] h-[1.5px] md:h-[2px] bg-border-main block z-0">
            <div 
              className="h-full bg-primary-gold transition-all duration-500 ease-in-out" 
              style={{ width: `${(Math.min(dbStatusIndex, 3) / 3) * 100}%` }}
            />
          </div>

          {STEPS.map((step, index) => {
            const isCurrentPage = step.key === currentStep
            const isAllowed = index <= dbStatusIndex
            
            // Icon logic
            let icon = null
            if (step.key === 'review') {
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )
            } else if (step.key === 'production') {
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            } else if (step.key === 'packing') {
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )
            } else {
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              )
            }

            return (
              <Link
                key={step.key}
                href={isAllowed ? `/${step.path}/${orderId}` : '#'}
                onClick={(e) => handleStepClick(e, step.label, index)}
                className={`relative z-10 flex flex-col items-center group flex-1 ${
                  isAllowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                }`}
              >
                {/* Step Circle */}
                <div 
                  className={`w-8 h-8 md:w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isCurrentPage
                      ? 'bg-primary-gold border-primary-gold text-white shadow-md shadow-primary-gold/20 scale-105 font-bold ring-2 ring-primary-gold/10'
                      : isAllowed
                        ? 'bg-bg-card border-emerald-500 text-emerald-500 dark:border-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20'
                        : 'bg-bg-card border-border-main text-txt-muted'
                  }`}
                >
                  {/* Done checkmark for completed previous steps */}
                  {!isCurrentPage && isAllowed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    icon
                  )}
                </div>

                {/* Step Label */}
                <span 
                  className={`mt-1.5 text-[10px] md:text-xs font-semibold tracking-wide transition-all duration-300 text-center ${
                    isCurrentPage 
                      ? 'text-primary-gold font-bold scale-105' 
                      : isAllowed 
                        ? 'text-txt-main group-hover:text-primary-gold' 
                        : 'text-txt-muted'
                  }`}
                >
                  {step.label}
                </span>

                {/* Status Badge beneath the label (Desktop only) */}
                <span className="hidden sm:block mt-0.5 text-[8px] uppercase tracking-widest scale-90 opacity-70">
                  {isCurrentPage 
                    ? 'Active' 
                    : isAllowed 
                      ? 'Unlocked' 
                      : 'Locked'
                  }
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Beautiful Custom Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-border-main rounded-card max-w-sm w-full p-6 shadow-2xl animate-scale-up text-center">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/25">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-txt-main font-display mb-2">Akses Terkunci</h3>
            <p className="text-xs text-txt-muted mb-6 leading-relaxed">
              {alertMessage}
            </p>
            <button 
              onClick={() => setAlertMessage(null)}
              className="w-full py-2.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary-gold/10"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  )
}

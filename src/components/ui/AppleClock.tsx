'use client'

import { useState, useEffect } from 'react'

interface AppleClockProps {
  className?: string
  showSeconds?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function AppleClock({ 
  className = '', 
  showSeconds = true,
  size = 'medium' 
}: AppleClockProps) {
  const [time, setTime] = useState<Date | null>(null)

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }

  const dateSizeClasses = {
    small: 'text-[10px]',
    medium: 'text-xs',
    large: 'text-sm'
  }

  useEffect(() => {
    // Initialize time on client side only to prevent hydration mismatch
    setTime(new Date())
    
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Don't render anything until client-side hydration is complete
  if (!time) {
    return (
      <div className={`apple-clock ${className}`}>
        <div className="flex flex-col items-center text-center font-apple">
          <div className={`font-medium text-apple-primary ${sizeClasses[size]}`}>
            --:--:-- --
          </div>
          <div className={`text-apple-tertiary ${dateSizeClasses[size]}`}>
            --- --, ----
          </div>
        </div>
      </div>
    )
  }

  const formatTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: true
    }
    return date.toLocaleTimeString('en-US', options)
  }

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className={`apple-clock ${className}`}>
      <div className="flex flex-col items-center text-center font-apple">
        <div className={`font-medium text-apple-primary ${sizeClasses[size]}`}>
          {formatTime(time)}
        </div>
        <div className={`text-apple-tertiary ${dateSizeClasses[size]}`}>
          {formatDate(time)}
        </div>
      </div>
    </div>
  )
}
"use client"

import { Menu, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface TopNavProps {
  onMenuToggle: () => void
}

// Custom hook for real-time clock
const useCurrentTime = () => {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return time
}

// Custom hook for user status
const useUserStatus = () => {
  const [status, setStatus] = useState<'active' | 'away'>('active')
  
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const resetTimer = () => {
      clearTimeout(timeout)
      setStatus('active')
      timeout = setTimeout(() => setStatus('away'), 300000) // 5 minutes
    }
    
    const events = ['mousemove', 'keypress', 'click', 'scroll']
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })
    
    resetTimer() // Initialize timer
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      clearTimeout(timeout)
    }
  }, [])
  
  return status
}

// Constants
const TIME_CONFIG = {
  timeZone: 'Asia/Kolkata',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
} as const

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const currentTime = useCurrentTime()
  const userStatus = useUserStatus()

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
    onMenuToggle()
  }, [onMenuToggle])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleMenuToggle()
    }
  }

  const formatTime = useCallback((date: Date) => {
    try {
      return date.toLocaleTimeString('en-IN', TIME_CONFIG)
    } catch (error) {
      return date.toLocaleTimeString()
    }
  }, [])

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center group">
          <h1 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-300 group-hover:scale-105" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            STARWEAVER
          </h1>
          <span className="ml-3 text-sm text-slate-400 font-medium">Productivity</span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={handleMenuToggle}
          onKeyDown={handleKeyDown}
          className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 active:scale-95"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          data-testid="mobile-menu-button"
        >
          <div className="transition-transform duration-200">
            {isMenuOpen ? (
              <X className="h-5 w-5 text-slate-300" />
            ) : (
              <Menu className="h-5 w-5 text-slate-300" />
            )}
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">Current Time: </span>
            <span className="font-mono text-blue-400 transition-colors duration-200">
              {formatTime(currentTime)} IST
            </span>
          </div>
          
          <div className="w-px h-6 bg-slate-600"></div>
          
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">Status: </span>
            <span 
              className={`font-medium transition-all duration-300 ${
                userStatus === 'active' 
                  ? 'text-green-400 animate-pulse' 
                  : 'text-yellow-400'
              }`}
            >
              {userStatus === 'active' ? 'Active' : 'Away'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
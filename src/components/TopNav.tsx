"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

interface TopNavProps {
  onMenuToggle: () => void
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
    onMenuToggle()
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" style={{ fontFamily: 'Georgia, serif' }}>
            STARWEAVER
          </h1>
          <span className="ml-3 text-sm text-slate-400 font-medium">Productivity</span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={handleMenuToggle}
          className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-slate-300" />
          ) : (
            <Menu className="h-5 w-5 text-slate-300" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">Current Time: </span>
            <span className="font-mono text-blue-400">
              {new Date().toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })} IST
            </span>
          </div>
          
          <div className="w-px h-6 bg-slate-600"></div>
          
          <div className="text-sm text-slate-300">
            <span className="text-slate-400">Status: </span>
            <span className="text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

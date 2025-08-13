"use client"

import { useState } from "react"
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Download, 
  ChevronRight,
  Home,
  BarChart3,
  Users,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  description: string
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
    description: "Overview and analytics"
  },
  {
    id: "daily-entry",
    label: "Daily Entry",
    icon: <Calendar className="h-5 w-5" />,
    href: "/daily-entry",
    description: "Submit daily work entries"
  },
  {
    id: "manage",
    label: "Manage",
    icon: <Settings className="h-5 w-5" />,
    href: "/manage",
    description: "Team and settings"
  },
  {
    id: "export",
    label: "Export",
    icon: <Download className="h-5 w-5" />,
    href: "/export",
    description: "Download reports and data"
  }
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard")

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId)
    // In a real app, you would navigate here
    console.log(`Navigating to: ${itemId}`)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Navigation</h2>
              <p className="text-sm text-slate-400">Starweaver Tools</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 group hover:bg-slate-800/50",
                activeItem === item.id 
                  ? "bg-blue-600/20 border border-blue-500/30 text-blue-400" 
                  : "text-slate-300 hover:text-slate-100"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "transition-colors duration-200",
                  activeItem === item.id ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"
                )}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-300">
                    {item.description}
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform duration-200",
                activeItem === item.id ? "text-blue-400 rotate-90" : "text-slate-500 group-hover:text-slate-400"
              )} />
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2">Quick Stats</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/50 rounded-lg p-2">
                <div className="text-slate-400">Today</div>
                <div className="text-green-400 font-semibold">8 videos</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2">
                <div className="text-slate-400">Week</div>
                <div className="text-blue-400 font-semibold">42 videos</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

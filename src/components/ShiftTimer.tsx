"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShiftTimer() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [timeUntilShift, setTimeUntilShift] = useState<string>("")

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      // Check if it's weekend (Saturday = 6, Sunday = 0)
      const dayOfWeek = now.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setTimeUntilShift("Shift starts Monday 10:00")
        return
      }

      // Calculate time until 19:00 (7 PM)
      const shiftTime = new Date(now)
      shiftTime.setHours(19, 0, 0, 0)
      
      if (now >= shiftTime) {
        setTimeUntilShift("Shift ended for today")
        return
      }

      const diff = shiftTime.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilShift(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format current time in IST
  const formatISTTime = (date: Date) => {
    // Use a consistent time format to avoid hydration mismatches
    // Convert to IST (UTC+5:30)
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
    
    const hours = istDate.getUTCHours().toString().padStart(2, '0')
    const minutes = istDate.getUTCMinutes().toString().padStart(2, '0')
    const seconds = istDate.getUTCSeconds().toString().padStart(2, '0')
    
    return `${hours}:${minutes}:${seconds}`
  }

  const formatISTDate = (date: Date) => {
    // Use a consistent date format to avoid hydration mismatches
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    // Convert to IST (UTC+5:30)
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
    
    const weekday = weekdays[istDate.getUTCDay()]
    const day = istDate.getUTCDate()
    const month = months[istDate.getUTCMonth()]
    const year = istDate.getUTCFullYear()
    
    return `${weekday} ${day} ${month}, ${year}`
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-100">
          <Clock className="h-6 w-6 text-blue-400 flex-shrink-0" />
          <span className="text-lg font-bold">Shift Timer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-blue-400 mb-3">
            {formatISTTime(currentTime)}
          </div>
          <div className="text-sm text-slate-300 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatISTDate(currentTime)}</span>
          </div>
        </div>
        
        <div className="text-center pt-4 border-t border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Time until shift ends</div>
          <div className="text-2xl font-mono font-semibold text-green-400">
            {timeUntilShift}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

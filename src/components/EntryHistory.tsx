"use client"

import { useState } from "react"
import { Calendar, Video, MessageSquare, Briefcase, Home, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock data for entry history
const mockEntries = [
  {
    id: 1,
    date: "2024-08-12",
    videos: 8,
    workedMarketing: true,
    leave: false,
    comment: "Completed all assigned videos. Worked on social media content for 2 hours.",
    timestamp: "09:30 AM"
  },
  {
    id: 2,
    date: "2024-08-11",
    videos: 6,
    workedMarketing: false,
    leave: false,
    comment: "Had technical issues with editing software. Managed to complete 6 videos.",
    timestamp: "10:15 AM"
  },
  {
    id: 3,
    date: "2024-08-10",
    videos: 1,
    workedMarketing: true,
    leave: false,
    comment: "Only one video due to client revision requests. Spent extra time on marketing materials.",
    timestamp: "08:45 AM"
  },
  {
    id: 4,
    date: "2024-08-09",
    videos: 0,
    workedMarketing: false,
    leave: true,
    comment: "On sick leave today.",
    timestamp: "09:00 AM"
  },
  {
    id: 5,
    date: "2024-08-08",
    videos: 9,
    workedMarketing: false,
    leave: false,
    comment: "Excellent productivity day. All videos completed ahead of schedule.",
    timestamp: "09:20 AM"
  },
  {
    id: 6,
    date: "2024-08-07",
    videos: 7,
    workedMarketing: true,
    leave: false,
    comment: "Good progress on videos. Created marketing content for new campaign.",
    timestamp: "09:10 AM"
  }
]

export default function EntryHistory() {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [filteredEntries, setFilteredEntries] = useState(mockEntries)

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    if (date) {
      const filtered = mockEntries.filter(entry => entry.date === date)
      setFilteredEntries(filtered)
    } else {
      setFilteredEntries(mockEntries)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (entry: typeof mockEntries[0]) => {
    if (entry.leave) {
      return <Home className="h-4 w-4 text-red-400" />
    }
    if (entry.workedMarketing) {
      return <Briefcase className="h-4 w-4 text-blue-400" />
    }
    return <Video className="h-4 w-4 text-green-400" />
  }

  const getStatusText = (entry: typeof mockEntries[0]) => {
    if (entry.leave) return "On Leave"
    if (entry.workedMarketing) return "Marketing + Videos"
    return "Videos Only"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Clock className="h-5 w-5 text-blue-400" />
          Entry History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="history-date" className="text-slate-200">
            Filter by Date
          </Label>
          <Input
            id="history-date"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500"
            placeholder="Select date to filter entries"
          />
        </div>

        {/* Entries List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-400 border-b border-slate-700 pb-2">
            <span>Showing {filteredEntries.length} entries</span>
            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate("")
                  setFilteredEntries(mockEntries)
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear Filter
              </button>
            )}
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No entries found for the selected date</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(entry)}
                      <div>
                        <div className="font-medium text-slate-100">
                          {formatDate(entry.date)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {getStatusText(entry)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-100">
                        {entry.videos} {entry.videos === 1 ? 'video' : 'videos'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {entry.timestamp}
                      </div>
                    </div>
                  </div>

                  {entry.comment && (
                    <div className="flex items-start gap-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                      <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {entry.comment}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className={`px-2 py-1 rounded-full ${
                      entry.leave 
                        ? 'bg-red-500/20 text-red-400' 
                        : entry.workedMarketing 
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {entry.leave ? 'Leave' : entry.workedMarketing ? 'Marketing' : 'Videos'}
                    </span>
                    <span>ID: {entry.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

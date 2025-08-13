"use client"

import { useState } from "react"
import { Trophy, ChevronDown, ChevronUp, Medal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data for top editors
const mockEditors = [
  { id: 1, name: "Alex Chen", videos: 127, rank: 1, avatar: "AC" },
  { id: 2, name: "Sarah Johnson", videos: 119, rank: 2, avatar: "SJ" },
  { id: 3, name: "Mike Rodriguez", videos: 112, rank: 3, avatar: "MR" },
  { id: 4, name: "Emily Davis", videos: 108, rank: 4, avatar: "ED" },
  { id: 5, name: "David Kim", videos: 105, rank: 5, avatar: "DK" },
  { id: 6, name: "Lisa Wang", videos: 98, rank: 6, avatar: "LW" },
  { id: 7, name: "Tom Anderson", videos: 94, rank: 7, avatar: "TA" },
  { id: 8, name: "Rachel Green", videos: 89, rank: 8, avatar: "RG" },
  { id: 9, name: "Chris Brown", videos: 85, rank: 9, avatar: "CB" },
  { id: 10, name: "Jessica Lee", videos: 82, rank: 10, avatar: "JL" },
]

export default function LeaderboardCard() {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400 flex-shrink-0" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600 flex-shrink-0" />
      default:
        return <span className="text-sm font-semibold text-slate-400 flex-shrink-0">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30"
      default:
        return "bg-slate-800/50 border-slate-700"
    }
  }

  const displayedEditors = isExpanded ? mockEditors : mockEditors.slice(0, 5)

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-100">
          <Trophy className="h-6 w-6 text-yellow-500 flex-shrink-0" />
          <span className="text-lg font-bold">Top Editors - Current Month</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {displayedEditors.map((editor) => (
            <div
              key={editor.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${getRankColor(editor.rank)}`}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-slate-200 text-sm font-semibold flex-shrink-0">
                  {editor.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 truncate">{editor.name}</div>
                  <div className="text-sm text-slate-400">{editor.videos} videos</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getRankIcon(editor.rank)}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 transition-colors duration-200 py-3"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2 flex-shrink-0" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
              View All ({mockEditors.length})
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

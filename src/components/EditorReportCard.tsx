"use client"

import { useState } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Target, CheckCircle } from "lucide-react"

// Mock data for weekly performance
const weeklyData = [
  { day: "Mon", target: 8, achieved: 9, efficiency: 112.5 },
  { day: "Tue", target: 8, achieved: 7, efficiency: 87.5 },
  { day: "Wed", target: 8, achieved: 10, efficiency: 125 },
  { day: "Thu", target: 8, achieved: 8, efficiency: 100 },
  { day: "Fri", target: 8, achieved: 6, efficiency: 75 },
  { day: "Sat", target: 4, achieved: 5, efficiency: 125 },
  { day: "Sun", target: 4, achieved: 3, efficiency: 75 },
]

// Mock data for monthly performance
const monthlyData = [
  { week: "Week 1", target: 40, achieved: 42, efficiency: 105 },
  { week: "Week 2", target: 40, achieved: 38, efficiency: 95 },
  { week: "Week 3", target: 40, achieved: 45, efficiency: 112.5 },
  { week: "Week 4", target: 40, achieved: 41, efficiency: 102.5 },
]

// Mock data for pie chart
const pieData = [
  { name: "Target Met", value: 65, color: "#10b981" },
  { name: "Above Target", value: 20, color: "#3b82f6" },
  { name: "Below Target", value: 15, color: "#ef4444" },
]

export default function EditorReportCard() {
  const [activeTab, setActiveTab] = useState("week")

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return "text-green-400"
    if (efficiency >= 80) return "text-yellow-400"
    return "text-red-400"
  }

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 100) return <CheckCircle className="h-4 w-4 text-green-400" />
    if (efficiency >= 80) return <TrendingUp className="h-4 w-4 text-yellow-400" />
    return <Target className="h-4 w-4 text-red-400" />
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Editor Performance Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="week" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Weekly View
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Monthly View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Daily Performance</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="target" fill="#64748b" name="Target" />
                    <Bar dataKey="achieved" fill="#3b82f6" name="Achieved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Efficiency Overview</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Daily Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-300">{day.day}</div>
                      <div className="text-lg font-bold text-slate-100">{day.achieved}/{day.target}</div>
                      <div className={`text-xs flex items-center justify-center gap-1 ${getEfficiencyColor(day.efficiency)}`}>
                        {getEfficiencyIcon(day.efficiency)}
                        {day.efficiency}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Weekly Performance</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="week" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="target" stroke="#64748b" strokeWidth={2} name="Target" />
                    <Line type="monotone" dataKey="achieved" stroke="#3b82f6" strokeWidth={2} name="Achieved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Monthly Summary</h4>
                <div className="space-y-3">
                  {monthlyData.map((week) => (
                    <div key={week.week} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div>
                        <div className="font-medium text-slate-100">{week.week}</div>
                        <div className="text-sm text-slate-400">{week.achieved}/{week.target} videos</div>
                      </div>
                      <div className={`text-right ${getEfficiencyColor(week.efficiency)}`}>
                        <div className="text-lg font-bold">{week.efficiency}%</div>
                        <div className="text-xs">{getEfficiencyIcon(week.efficiency)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

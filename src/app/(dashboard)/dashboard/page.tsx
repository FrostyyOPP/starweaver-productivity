import ShiftTimer from "@/components/ShiftTimer"
import LeaderboardCard from "@/components/LeaderboardCard"
import EditorReportCard from "@/components/EditorReportCard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-3">Dashboard</h1>
          <p className="text-lg text-slate-400">Welcome to Starweaver Productivity Dashboard</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column - Timer and Leaderboard */}
          <div className="lg:col-span-4 space-y-8">
            <ShiftTimer />
            <LeaderboardCard />
          </div>

          {/* Right Column - Reports */}
          <div className="lg:col-span-8">
            <EditorReportCard />
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Total Videos This Month</p>
                <p className="text-3xl font-bold text-slate-100">1,247</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📹</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Team Efficiency</p>
                <p className="text-3xl font-bold text-slate-100">94.2%</p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Active Editors</p>
                <p className="text-3xl font-bold text-slate-100">12</p>
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

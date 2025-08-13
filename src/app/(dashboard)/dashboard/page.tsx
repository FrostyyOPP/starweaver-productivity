import ShiftTimer from "@/components/ShiftTimer"
import LeaderboardCard from "@/components/LeaderboardCard"
import EditorReportCard from "@/components/EditorReportCard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome to Starweaver Productivity Dashboard</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Timer and Leaderboard */}
          <div className="lg:col-span-4 space-y-6">
            <ShiftTimer />
            <LeaderboardCard />
          </div>

          {/* Right Column - Reports */}
          <div className="lg:col-span-8">
            <EditorReportCard />
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Videos This Month</p>
                <p className="text-2xl font-bold text-slate-100">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📹</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Team Efficiency</p>
                <p className="text-2xl font-bold text-slate-100">94.2%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Editors</p>
                <p className="text-2xl font-bold text-slate-100">12</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

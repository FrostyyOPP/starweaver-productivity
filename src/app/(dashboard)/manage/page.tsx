import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings, BarChart3, Shield } from "lucide-react"

export default function ManagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Manage</h1>
          <p className="text-slate-400">Team management and system settings</p>
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Team Management */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Users className="h-5 w-5 text-blue-400" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300">
                <p>• Add/Remove team members</p>
                <p>• Assign roles and permissions</p>
                <p>• View team performance</p>
                <p>• Manage team settings</p>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400">Current Team Size</div>
                <div className="text-2xl font-bold text-blue-400">12 Members</div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Performance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300">
                <p>• Set daily video targets</p>
                <p>• Configure efficiency metrics</p>
                <p>• Adjust reporting periods</p>
                <p>• Customize dashboards</p>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400">Daily Target</div>
                <div className="text-2xl font-bold text-green-400">8 Videos</div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Settings className="h-5 w-5 text-purple-400" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300">
                <p>• Application preferences</p>
                <p>• Notification settings</p>
                <p>• Data export options</p>
                <p>• Security settings</p>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400">System Status</div>
                <div className="text-2xl font-bold text-purple-400">Online</div>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Shield className="h-5 w-5 text-red-400" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300">
                <p>• User permissions</p>
                <p>• Role management</p>
                <p>• Security policies</p>
                <p>• Audit logs</p>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400">Active Sessions</div>
                <div className="text-2xl font-bold text-red-400">8 Users</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg transition-colors text-left">
              <div className="text-blue-400 font-medium">Add Team Member</div>
              <div className="text-sm text-slate-400">Invite new editor</div>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg transition-colors text-left">
              <div className="text-green-400 font-medium">Generate Report</div>
              <div className="text-sm text-slate-400">Monthly performance</div>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg transition-colors text-left">
              <div className="text-purple-400 font-medium">Backup Data</div>
              <div className="text-sm text-slate-400">Export all entries</div>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg transition-colors text-left">
              <div className="text-red-400 font-medium">System Health</div>
              <div className="text-sm text-slate-400">Check status</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

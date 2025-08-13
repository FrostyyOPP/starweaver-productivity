import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, BarChart3, Calendar, Users, TrendingUp } from "lucide-react"

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Export Data</h1>
          <p className="text-slate-400">Download reports and data in various formats</p>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Daily Reports */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Calendar className="h-5 w-5 text-blue-400" />
                Daily Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Export daily productivity reports with video counts, marketing work, and comments.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Today
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Select Date Range
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Analytics */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Weekly Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Comprehensive weekly performance reports with charts and efficiency metrics.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  This Week
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Previous Weeks
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Reports */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Monthly Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Detailed monthly summaries with team performance and trend analysis.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  This Month
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Select Month
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Users className="h-5 w-5 text-red-400" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Individual and team performance reports with rankings and comparisons.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  All Members
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Users className="h-4 w-4 mr-2" />
                  Select Members
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Raw Data Export */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <FileText className="h-5 w-5 text-yellow-400" />
                Raw Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Export raw data in CSV, JSON, or Excel format for external analysis.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  <Download className="h-4 w-4 mr-2" />
                  CSV Format
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Other Formats
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Reports */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                Custom Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Create custom reports with specific metrics and date ranges.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Download className="h-4 w-4 mr-2" />
                  Build Report
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Settings */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Export Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-slate-200 mb-2">Default Format</h4>
              <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
            <div>
              <h4 className="font-medium text-slate-200 mb-2">Date Format</h4>
              <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <h4 className="font-medium text-slate-200 mb-2">Timezone</h4>
              <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100">
                <option>IST (UTC+5:30)</option>
                <option>UTC</option>
                <option>EST (UTC-5)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

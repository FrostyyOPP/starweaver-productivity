import EntryForm from "@/components/EntryForm"
import EntryHistory from "@/components/EntryHistory"

export default function DailyEntryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Daily Entry</h1>
          <p className="text-slate-400">Submit your daily work entries and view history</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Entry Form */}
          <div>
            <EntryForm />
          </div>

          {/* Right Column - Entry History */}
          <div>
            <EntryHistory />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">Entry Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-medium text-slate-200 mb-2">Required Fields:</h4>
              <ul className="space-y-1">
                <li>• Date (cannot be in the future)</li>
                <li>• Number of videos completed</li>
                <li>• Comment when videos count is 1</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-200 mb-2">Optional Fields:</h4>
              <ul className="space-y-1">
                <li>• Marketing work indicator</li>
                <li>• Leave status</li>
                <li>• Additional comments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

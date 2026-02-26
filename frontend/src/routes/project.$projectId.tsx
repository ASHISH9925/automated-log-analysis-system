import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/project/$projectId')({
  component: ProjectDashboard,
})

function ProjectDashboard() {
  const { projectId } = useParams({ from: '/project/$projectId' })
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate({ to: '/projects' })}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Project Dashboard</h1>
          <p className="text-gray-400 mb-6">
            Project ID: <code className="text-cyan-400">{projectId}</code>
          </p>

          <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
            <p className="text-gray-300">
              This dashboard is being developed by your teammates. Components will include:
            </p>
            <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
              <li>Summary Cards (Total logs, INFO/WARN/ERROR count, Active alerts)</li>
              <li>Graph Section (Error count over time)</li>
              <li>Active Alerts Preview</li>
              <li>Latest Logs Preview</li>
              <li>Navigation to detailed pages (Logs, Alerts, Chat)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

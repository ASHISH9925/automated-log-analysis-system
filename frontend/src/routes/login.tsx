import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button'
import { DottedGlowCard } from '../components/ui/dotted-glow-card'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate real authentication here, then navigate to /projects
    navigate({ to: '/projects' })
  }

  return (
    <div className="min-h-screen py-12 px-6 flex items-center justify-center">
      <DottedGlowCard className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Log Monitor Login</h1>
          <p className="text-gray-400 text-sm">
            Sign in to access your projects and start analyzing logs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              placeholder="Enter your password"
            />
          </div>

          <InteractiveHoverButton
            type="submit"
            text="Login"
            className="w-full mt-4"
          />
        </form>
      </DottedGlowCard>
    </div>
  )
}


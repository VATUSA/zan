import { useAuth } from '../context/AuthContext'

function About() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-white">
        About Page {user && `— logged in as ${user.name}`}
      </h1>
    </div>
  )
}

export default About
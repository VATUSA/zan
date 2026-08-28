import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import About from './pages/About'
import Roster from './pages/Roster'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav className="bg-slate-800 p-4 flex gap-4">
          <Link to="/" className="text-white hover:text-purple-400">Home</Link>
          <Link to="/about" className="text-white hover:text-purple-400">About</Link>
          <Link to="/roster" className="text-white hover:text-purple-400">Roster</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/roster" element={<Roster />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
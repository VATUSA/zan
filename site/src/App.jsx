import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import About from './pages/About'
import RosterHome from './pages/RosterHome'
import RosterVisiting from './pages/RosterVisiting'
import ApplyToVisit from './pages/ApplyToVisit'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/roster" element={<RosterHome />} />
          <Route path="/roster/home" element={<RosterHome />} />
          <Route path="/roster/visiting" element={<RosterVisiting />} />
          <Route path="/apply" element={<ApplyToVisit />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
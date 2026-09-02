import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import About from './pages/About'
import RosterHome from './pages/RosterHome'
import RosterVisiting from './pages/RosterVisiting'
import ApplyToVisit from './pages/ApplyToVisit'
import Profile from './pages/Profile'
import RosterMember from './pages/RosterMember'
import RequireRole from './components/RequireRole'
import Staff from './pages/Staff'
import Feedback from './pages/Feedback'
import StaffDashboard from './pages/StaffDashboard'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import FilesSops from './pages/FilesSops'
import FilesLoas from './pages/FilesLoas'
import FilesTraining from './pages/FilesTraining'
import FilesAdmin from './pages/FilesAdmin'
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
          <Route path="/staff" element={<Staff />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
<Route path="/files" element={<FilesSops />} />
<Route path="/files/sops" element={<FilesSops />} />
<Route path="/files/loas" element={<FilesLoas />} />
<Route path="/files/training" element={<FilesTraining />} />
<Route path="/files/admin" element={<FilesAdmin />} />
          <Route
            path="/roster/member/:cid"
            element={
              <RequireRole role="INS">
                <RosterMember />
              </RequireRole>
            }
          />
          <Route
  path="/staff-dashboard"
  element={
    <RequireRole role="TA">
      <StaffDashboard />
    </RequireRole>
  }
/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
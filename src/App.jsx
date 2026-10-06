import { useApp } from './context/AppContext'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import Header from './components/Header'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import SubjectDetail from './pages/SubjectDetail'
import LessonDetail from './pages/LessonDetail'
import Vault from './pages/Vault'
import Reviews from './pages/Reviews'
import Planner from './pages/Planner'
import Statistics from './pages/Statistics'
import TimerPage from './pages/Timer'
import Achievements from './pages/Achievements'
import Settings from './pages/Settings'

export default function App() {
  const { state } = useApp()
  const location = useLocation()

  if (!state.onboarded) {
    return <Onboarding />
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Header />
        <main className="flex-1 pb-24 md:pb-8">
          <div key={location.pathname} className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
              <Route path="/subjects/:subjectId/chapters/:chapterId/lessons/:lessonId" element={<LessonDetail />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
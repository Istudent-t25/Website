import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Students from './pages/Students.jsx'
import ExamsGrade12 from './pages/ExamsGrade12.jsx'
import Schedule from './pages/Schedule.jsx'
import LoginModal from './components/LoginModal.jsx'
import RegisterModal from './components/RegisterModal.jsx'
import UserDetailsModal from './components/UserDetailsModal.jsx'
import SoundsPage from './pages/Sounds.jsx'
import GrammarPage from './pages/Grammers.jsx'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [user, setUser] = useState(null)
  const [registeredStudentId, setRegisteredStudentId] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || '')

  const closeModal = () => {
    setShowLoginModal(false)
    setShowRegisterModal(false)
    setShowUserDetailsModal(false)
  }

  const openLoginModal = () => {
    closeModal()
    setShowLoginModal(true)
    setSidebarOpen(false)
  }

  const openRegisterModal = () => {
    closeModal()
    setShowRegisterModal(true)
    setSidebarOpen(false)
  }

  const openUserDetailsModal = () => {
    closeModal()
    setShowUserDetailsModal(true)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setAccessToken('')
    setUser(null)
    setRegisteredStudentId(null)
  }

  const handleSignupSuccess = (userData) => {
    const studentId = userData.id || userData.studentId
    if (studentId) {
      setRegisteredStudentId(studentId)
      openUserDetailsModal()
    } else {
      closeModal()
    }
  }

  const handleSaveUserDetails = (details) => {
    setUser({
      id: registeredStudentId,
      name: 'New User',
      ...details
    })
    setRegisteredStudentId(null)
    closeModal()
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) return
      try {
        const response = await fetch('http://134.209.212.209:8000/student/v1/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Client-Type': 'student'
          }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else if (response.status === 401) {
          localStorage.removeItem('access_token')
          setAccessToken('')
          setUser(null)
        } else {
          await response.json().catch(() => null)
        }
      } catch {
        /* ignore network errors silently */
      }
    }
    fetchUser()
  }, [accessToken])

  return (
    <div dir="rtl" className="flex min-h-screen bg-gray-100 text-gray-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
        openLoginModal={openLoginModal}
        openRegisterModal={openRegisterModal}
      />
      <div className="flex flex-col flex-1 min-h-screen">
        <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students/:grade" element={<Students />} />
            <Route path="/exams/grade12" element={<ExamsGrade12 />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/sounds" element={<SoundsPage />} />
            <Route path="/grammar/:lang" element={<GrammarPage />} />
            <Route path="*" element={<p className="text-center text-red-500">هەڵە: پەڕە نەدۆزرایەوە</p>} />
          </Routes>
        </main>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeModal}
        onSwitchToRegister={openRegisterModal}
        onLoginSuccess={({ accessToken }) => {
          localStorage.setItem('access_token', accessToken)
          setAccessToken(accessToken)
          closeModal()
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={closeModal}
        onSwitchToLogin={openLoginModal}
        onSignupSuccess={handleSignupSuccess}
      />
      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={closeModal}
        onSaveDetails={handleSaveUserDetails}
        studentId={registeredStudentId}
      />
    </div>
  )
}

export default App

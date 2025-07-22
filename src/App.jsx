import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import { Routes, Route } from "react-router-dom"
import Students from "./pages/Students"
import ExamsGrade12 from "./pages/ExamsGrade12"
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div dir="rtl" className="flex min-h-screen font-kurdish bg-gray-100 text-gray-800">
      {/* Sidebar (mobile toggle support) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/students/:grade" element={<Students />} />
            <Route path="/exams/grade12" element={<ExamsGrade12 />} />
            <Route path="*" element={<p>هەڵە: پەڕە نەدۆزرایەوە</p>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App

import {
  Home, Users, FileText, ChevronDown, ChevronUp, Calendar,
  ImagePlus, Moon, X
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from "react-router-dom"

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)

  const handleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key)
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      ></div>

      {/* ✅ Sidebar Container */}
      <div className={`
        fixed md:static top-0 right-0 z-40 w-72 h-screen md:h-auto bg-white shadow-xl md:shadow-none p-4
        flex flex-col justify-between rounded-l-3xl rtl
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0
      `}>
        <div>
          {/* 🔹 Mobile Close Button */}
          <div className="flex items-center justify-between md:hidden mb-4">
            <div className="text-2xl font-bold text-blue-600">من خوێندکارم</div>
            <button onClick={onClose}><X size={24} /></button>
          </div>

          {/* 🔸 Main Menu */}
          <nav className="space-y-2">
            {/* Dashboard */}
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive("/") ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Home size={20} />
              <span>سەرەکی</span>
            </Link>

            {/* Students Dropdown */}
            <div>
              <button
                onClick={() => handleDropdown("students")}
                className={`flex justify-between items-center w-full px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith("/students") ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <span>خوێندکارەکان</span>
                </div>
                {openDropdown === "students" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {openDropdown === "students" && (
                <div className="pl-12 mt-2 space-y-1">
                  {["grade7", "grade8", "grade9", "grade10", "grade11", "grade12"].map((gradeKey, i) => (
                    <Link
                      to={`/students/${gradeKey}`}
                      onClick={onClose}
                      key={gradeKey}
                      className={`block w-full text-right text-sm px-3 py-2 rounded-lg transition ${
                        isActive(`/students/${gradeKey}`)
                          ? 'bg-blue-200 text-blue-800 font-bold'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      پۆلی {7 + i}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Exams Dropdown */}
            <div>
              <button
                onClick={() => handleDropdown("exams")}
                className={`flex justify-between items-center w-full px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith("/exams") ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <span>تاقیکردنەوەکان</span>
                </div>
                {openDropdown === "exams" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {openDropdown === "exams" && (
                <div className="pl-12 mt-2 space-y-1">
                 <Link
  to="/exams/grade12"
  onClick={onClose}
  className={`block text-right text-sm px-3 py-2 rounded-lg transition ${
    isActive("/exams/grade12")
      ? 'bg-blue-200 text-blue-800 font-bold'
      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
  }`}
>
  پۆلی ١٢
</Link>

                  <Link
                    to="/exams/results"
                    onClick={onClose}
                    className={`block text-right text-sm px-3 py-2 rounded-lg transition ${
                      isActive("/exams/results")
                        ? 'bg-blue-200 text-blue-800 font-bold'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    ئەنجامەکان
                  </Link>
                </div>
              )}
            </div>

            {/* Schedule */}
            <Link
              to="/schedule"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive("/schedule") ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Calendar size={20} />
              <span>ڕێکخستنەکان</span>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-500">ڕەنگ</span>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
            <Moon size={18} />
            تاریک
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar

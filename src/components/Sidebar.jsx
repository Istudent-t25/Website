import {
  Home, Users, FileText, ChevronDown, ChevronUp, Calendar,
  Moon, X, UserCircle2, LogIn, LogOut, UserPlus
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from "react-router-dom"

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
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

      {/* Sidebar */}
      <div className={`
        fixed md:static top-0 right-0 z-40 w-72 h-screen bg-white shadow-xl p-4
        flex flex-col justify-between rounded-l-3xl rtl
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0
      `}>
        {/* Top Section: Title & Menu */}
        <div className="flex-grow"> {/* flex-grow allows this section to take available space */}
          {/* Title + Mobile Close */}
          <div className="flex items-center justify-between md:mb-6 mb-4">
            <div className="text-2xl font-bold text-blue-600">من خوێندکارم</div>
            <button onClick={onClose} className="md:hidden p-1 rounded-full hover:bg-gray-100 transition"><X size={24} /></button>
          </div>

          {/* Main Menu */}
          <nav className="space-y-2">
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
                  {["grade7", "grade8", "grade9", "grade10", "grade11", "grade12"].map((g, i) => (
                    <Link
                      key={g}
                      to={`/students/${g}`}
                      onClick={onClose}
                      className={`block text-sm px-3 py-2 rounded-lg text-right transition ${
                        isActive(`/students/${g}`)
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
                  <Link to="/exams/grade12" onClick={onClose} className={`block text-sm text-right px-3 py-2 rounded-lg transition ${
                    isActive("/exams/grade12")
                      ? 'bg-blue-200 text-blue-800 font-bold'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}>
                    پۆلی ١٢
                  </Link>
                  <Link to="/exams/results" onClick={onClose} className={`block text-sm text-right px-3 py-2 rounded-lg transition ${
                    isActive("/exams/results")
                      ? 'bg-blue-200 text-blue-800 font-bold'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}>
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
              <span>خشته‌ی هه‌فتانه‌</span>
            </Link>
          </nav>
        </div>

        {/* --- */}

        {/* Bottom Section: User/Auth Card & Theme Toggle */}
        <div className="pt-4 mt-auto"> {/* mt-auto pushes this section to the bottom */}
          {/* User Info / Auth Card */}
          <div className="bg-gray-50 p-3 rounded-xl shadow-sm mb-4 border border-gray-100"> {/* Card styling */}
            {user ? (
              <div className="flex items-center gap-3">
                <UserCircle2 size={36} className="text-blue-600" />
                <div className="flex flex-col text-sm text-right flex-grow">
                  <span className="font-semibold text-gray-800">بەخێربێیت، {user.name}</span>
                  <span className="text-xs text-gray-500">خوێندکار</span>
                  <button
                    onClick={onLogout}
                    className="text-red-600 text-xs mt-1 flex items-center gap-1 self-end hover:underline"
                  >
                    <LogOut size={14} />
                    چوونە دەرەوە
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <UserCircle2 size={36} className="text-blue-600" />
                  <div className="text-right flex-grow">
                    <div className="font-semibold text-gray-700">بەخێربێیت، میوانی ئازیز</div>
                    <div className="text-xs text-gray-500">تکایە چونەژوورەوە یان خۆت تۆمار بکە</div>
                  </div>
                </div>
                {/* Modified buttons to be block-level */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                  >
                    <LogIn size={18} />
                    چونەژوورەوە
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition duration-200 shadow-md"
                  >
                    <UserPlus size={18} />
                    خۆت تۆمار بکە
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
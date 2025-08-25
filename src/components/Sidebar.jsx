import { Home, Users, FileText, ChevronDown, ChevronUp, Calendar, Moon, X, UserCircle2, LogIn, LogOut, UserPlus, Book } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, user, onLogout, openLoginModal, openRegisterModal }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdown = (key) => setOpenDropdown(openDropdown === key ? null : key);
  const isActive = (path) => location.pathname === path;
  const isDropdownActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  // Framer Motion variants for individual navigation items
  const navItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: isOpen ? i * 0.04 : 0,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }),
    hover: { scale: 1.02, x: 5, transition: { type: "tween", duration: 0.15 } },
    tap: { scale: 0.98 }
  };

  // Framer Motion variants for dropdown content
  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeOut" } },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.2, ease: "easeOut" } },
  };

  // Base classes for consistent styling - Adjusted for white theme
  const linkBaseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group";
  const activeLinkClasses = "bg-blue-50 text-blue-800 shadow-md font-extrabold ring-2 ring-blue-500/50"; // Lighter blue for active background
  const inactiveLinkClasses = "text-gray-800 hover:bg-gray-100 hover:text-blue-700"; // Darker text, light gray hover

  const getLinkClasses = (path) => `${linkBaseClasses} ${isActive(path) ? activeLinkClasses : inactiveLinkClasses}`;
  const getDropdownButtonClasses = (paths) => `${linkBaseClasses} justify-between w-full ${isDropdownActive(paths) ? activeLinkClasses : inactiveLinkClasses}`;
  const getSubLinkClasses = (path) => `block text-sm text-right px-3 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.03] ${
    isActive(path) ? 'bg-blue-100 text-blue-900 font-extrabold' : 'text-gray-700 hover:text-blue-800 hover:bg-gray-50' // Adjusted sub-link colors
  }`;

  return (
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: isOpen ? '0%' : '100%', opacity: isOpen ? 1 : 0 }}
        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
        className={`
          fixed top-0 right-0 z-40 w-80 h-screen bg-white // Explicitly set background to white
          shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] // Adjusted shadow for lighter background
          p-6 flex flex-col justify-between rounded-l-3xl rtl
          md:static md:translate-x-0
        `}
      >
        <div className="flex-grow">
          {/* Sidebar Title + Mobile Close Button */}
          <div className="flex items-center justify-between md:mb-6 mb-4 pb-2 border-b border-gray-200"> {/* Lighter border */}
            <div className="text-2xl font-extrabold text-blue-700">من خوێندکارم</div>
            <button onClick={onClose} className="md:hidden p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <X size={24} className="text-gray-600 hover:text-red-500"/>
            </button>
          </div>

          {/* Main Navigation Menu */}
          <nav className="space-y-2">
            {/* Home Link */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={0}>
              <Link to="/" onClick={onClose} className={getLinkClasses("/")}>
                <Home size={20} className="group-hover:text-blue-700 text-blue-600" />
                <span>سەرەکی</span>
              </Link>
            </motion.div>

            {/* Subjects Dropdown */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={1}>
              <button onClick={() => handleDropdown("subjects")} className={getDropdownButtonClasses(["/students"])}>
                <div className="flex items-center gap-3">
                  <Book size={20} className="group-hover:text-blue-700 text-blue-600" />
                  <span>بابه‌ته‌كان</span>
                </div>
                {openDropdown === "subjects" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <AnimatePresence>
                {openDropdown === "subjects" && (
                  <motion.div
                    key="subjects-dropdown"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariants}
                    className="pl-12 mt-2 space-y-1 overflow-hidden"
                  >
                    {["grade7", "grade8", "grade9", "grade10", "grade11", "grade12"].map((g, i) => (
                      <Link key={g} to={`/students/${g}`} onClick={onClose} className={getSubLinkClasses(`/students/${g}`)}>
                        پۆلی {7 + i}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Exams Dropdown */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={2}>
              <button onClick={() => handleDropdown("exams")} className={getDropdownButtonClasses(["/exams"])}>
                <div className="flex items-center gap-3">
                  <FileText size={20} className="group-hover:text-blue-700 text-blue-600" />
                  <span>تاقیکردنەوەکان</span>
                </div>
                {openDropdown === "exams" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <AnimatePresence>
                {openDropdown === "exams" && (
                  <motion.div
                    key="exams-dropdown"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariants}
                    className="pl-12 mt-2 space-y-1 overflow-hidden"
                  >
                    <Link to="/exams/grade12" onClick={onClose} className={getSubLinkClasses("/exams/grade12")}>
                      پۆلی ١٢
                    </Link>
                    <Link to="/exams/results" onClick={onClose} className={getSubLinkClasses("/exams/results")}>
                      ئەنجامەکان
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Grammar Dropdown */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={3}>
              <button onClick={() => handleDropdown("grammar")} className={getDropdownButtonClasses(["/grammar"])}>
                <div className="flex items-center gap-3">
                  <FileText size={20} className="group-hover:text-blue-700 text-blue-600" />
                  <span>ڕێزمانه‌كان</span>
                </div>
                {openDropdown === "grammar" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <AnimatePresence>
                {openDropdown === "grammar" && (
                  <motion.div
                    key="grammar-dropdown"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariants}
                    className="pl-12 mt-2 space-y-1 overflow-hidden"
                  >
                    <Link to="/grammar/english" onClick={onClose} className={getSubLinkClasses("/grammar/english")}>
                      English Grammar
                    </Link>
                    <Link to="/grammar/kurdish" onClick={onClose} className={getSubLinkClasses("/grammar/kurdish")}>
                      ڕێزمانی كوردی
                    </Link>
                    <Link to="/grammar/arabic" onClick={onClose} className={getSubLinkClasses("/grammar/arabic")}>
                      القواعد العربیه
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Text Tools Link */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={4}>
              <Link to="/text-tools" onClick={onClose} className={getLinkClasses("/text-tools")}>
                <FileText size={20} className="group-hover:text-blue-700 text-blue-600" />
                <span>ئامڕازەکانی نووسین</span>
              </Link>
            </motion.div>

            {/* Schedule Link */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={5}>
              <Link to="/schedule" onClick={onClose} className={getLinkClasses("/schedule")}>
                <Calendar size={20} className="group-hover:text-blue-700 text-blue-600" />
                <span>خشته‌ی هه‌فتانه‌</span>
              </Link>
            </motion.div>

            {/* Sounds Link */}
            <motion.div variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap" custom={6}>
              <Link to="/sounds" onClick={onClose} className={getLinkClasses("/sounds")}>
                <Calendar size={20} className="group-hover:text-blue-700 text-blue-600" />
                <span>ده‌نگه‌كان</span>
              </Link>
            </motion.div>
          </nav>
        </div>

        {/* Bottom Section: User/Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className="pt-4 mt-auto border-t border-gray-200" // Lighter border
        >
          <div className="bg-white p-4 rounded-xl shadow-xl mb-4 border border-gray-200"> {/* White background, lighter border */}
            {user ? (
              <div className="flex items-center gap-3">
                <UserCircle2 size={36} className="text-blue-600" />
                <div className="flex flex-col text-sm text-right flex-grow">
                  <span className="font-semibold text-gray-800">بەخێربێیت، {user.name}</span> {/* Darker text */}
                  <span className="text-xs text-gray-600">خوێندکار</span> {/* Darker text */}
                  <button onClick={onLogout} className="text-red-600 text-xs mt-1 flex items-center gap-1 self-end hover:underline hover:text-red-700 transition-colors duration-200">
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
                    <div className="font-semibold text-gray-800">بەخێربێیت، میوانی ئازیز</div> {/* Darker text */}
                    <div className="text-xs text-gray-600">تکایە چونەژوورەوە یان خۆت تۆمار بکە</div> {/* Darker text */}
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200"> {/* Lighter border */}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openLoginModal} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                    <LogIn size={18} />
                    چوونەژوورەوە
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openRegisterModal} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition duration-200 shadow-md">
                    <UserPlus size={18} />
                    خۆت تۆمار بکە
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Sidebar;

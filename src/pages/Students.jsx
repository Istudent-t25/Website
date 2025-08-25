import { useParams } from "react-router-dom"
import { useState } from "react"
import ContentDisplay from "./../components/ContentDisplay"
import { motion } from "framer-motion"
import { BookOpen, Video, FileText, Book } from "lucide-react" // Ensure all necessary icons are imported

const filterItems = [
  { name: "کتێب", type: "book", icon: BookOpen },
  { name: "مه‌لزه‌مه‌", type: "booklet", icon: Book }, // Using Book for booklet, you can choose another if preferred
  { name: "ڤیدیۆ", type: "video", icon: Video },
  { name: "ئه‌سیله‌", type: "exam", icon: FileText }
]

const scienceFilter = ["زانستی", "ئەدەبی"]

const gradeNames = {
  grade7: "پۆلی 7",
  grade8: "پۆلی 8",
  grade9: "پۆلی 9",
  grade10: "پۆلی 10",
  grade11: "پۆلی 11",
  grade12: "پۆلی 12"
}
const activeFilterMap = {
  "book": "book",
  "booklet": "booklet",
  "video": "video",
  "exam": "exam"
}

const Students = () => {
  const { grade } = useParams()
  const gradeNum = parseInt(grade?.replace("grade", "")) || 0

  const [search, setSearch] = useState("")
  // Set initial activeFilter to the 'type' of the first item
  const [activeFilter, setActiveFilter] = useState(filterItems[0].type)
  const [trackFilter, setTrackFilter] = useState("")

  // Framer Motion variants for filter buttons
  const buttonVariants = {
    initial: { scale: 1, opacity: 1 },
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 10 } },
    tap: { scale: 0.95 },
    active: {
      scale: 1.02,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-slate-100">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        بابه‌ته‌كان – {gradeNames[grade]}
      </h2>

      {/* 🔍 Search Input */}
      <motion.input
        type="text"
        placeholder="گەڕان..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-right"
        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(96, 165, 250, 0.2)" }}
      />

      {/* 🎚️ Main Filters Section (Content Type) */}
      <div className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">جۆری ناوەرۆک:</label>
        <div className="flex flex-wrap gap-3">
          {filterItems.map((item) => (
            <motion.button
              key={item.type} // Use item.type as key
              onClick={() => setActiveFilter(item.type)} // Set activeFilter to item's type
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              animate={activeFilter === item.type ? "active" : "initial"} // Compare with item's type
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 justify-center
                ${activeFilter === item.type
                  ? "bg-blue-600 text-white ring-2 ring-blue-500/50 shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                }`}
            >
              <item.icon size={18} className="inline-block" /> {/* Render icon component */}
              {item.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 📚 Track Filter Section for Grade > 9 */}
      {gradeNum >= 10 && (
        <div className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">هەڵبژاردنی لق:</label>
          <div className="flex flex-wrap gap-3">
            {scienceFilter.map((track) => (
              <motion.button
                key={track}
                onClick={() => setTrackFilter(track)}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                animate={trackFilter === track ? "active" : "initial"}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap
                  ${trackFilter === track
                    ? "bg-green-600 text-white ring-2 ring-green-500/50 shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-700"
                  }`}
              >
                {track}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Content Display */}
      <ContentDisplay filter={activeFilter} track={trackFilter} search={search} />
    </div>
  )
}

export default Students

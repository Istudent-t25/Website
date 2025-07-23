import { useParams } from "react-router-dom"
import { useState } from "react"
import ContentDisplay from "./../components/ContentDisplay"

const filterItems = ["کتێب", "مه‌لزه‌مه‌", "ڤیدیۆ", "ئه‌سیله‌"]
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
  "کتێب": "book",
  "مه‌لزه‌مه‌": "booklet",
  "ڤیدیۆ": "video",
  "ئه‌سیله‌": "exam"
}

const Students = () => {
  const { grade } = useParams()
  const gradeNum = parseInt(grade?.replace("grade", "")) || 0

  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("کتێب")
  const [trackFilter, setTrackFilter] = useState("")

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">
        بابه‌ته‌كان – {gradeNames[grade]}
      </h2>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="گەڕان..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
      />

      {/* 🎚️ Filters */}
      <div className="flex flex-wrap gap-3 mt-4">
        {filterItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveFilter(item)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              activeFilter === item
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      

      {/* 📚 Track Filter for Grade > 9 */}
      {gradeNum >= 10 && (
        <div className="flex gap-3 mt-2">
          {scienceFilter.map((track) => (
            <button
            key={track}
            onClick={() => setTrackFilter(track)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              trackFilter === track
              ? "bg-green-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"
            }`}
            >
              {track}
            </button>
          ))}
        </div>
      )}

      <ContentDisplay filter={activeFilterMap[activeFilter]} track={trackFilter} />

      {/* 🧾 Content Placeholder */}
      {/* <div className="mt-6 p-4 border border-dashed rounded-xl text-center text-gray-500">
        ناوەرۆک بۆ "{activeFilter}" ـی {gradeNames[grade]} {trackFilter && `– ${trackFilter}`}، بە دوای "{search}"
      </div> */}
    </div>
  )
}

export default Students

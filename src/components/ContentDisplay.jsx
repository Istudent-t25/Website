import { useState } from "react"
import { BookOpen, Video, FileText } from "lucide-react"

const subjects = ["کوردی", "ئینگلیزی", "ماتماتیک", "فیزیا", "کیمیا", "ئەندازیارى"]

const teachersBySubject = {
  "کوردی": ["مامۆستا عومەر", "مامۆستا هێمن"],
  "ئینگلیزی": ["مامۆستا سارا", "مامۆستا ریبوار"],
  "ماتماتیک": ["مامۆستا ئارام"],
  "فیزیا": ["مامۆستا هوراز"],
  "کیمیا": ["مامۆستا ناز"],
  "ئەندازیارى": ["مامۆستا رێبوار"]
}

const sampleProducts = [
  {
    title: "کتێبی ماتماتیک 2024",
    url: "https://example.com/book1",
    type: "book",
    subject: "ماتماتیک",
    teacher: "مامۆستا ئارام",
    track: "زانیاری",
    image: "/images/test-flat-lay.png"
  },
  {
    title: "ڤیدیۆی فیزیا پارت 1",
    url: "https://youtube.com/video1",
    type: "video",
    subject: "فیزیا",
    teacher: "مامۆستا هوراز",
    track: "زانیاری",
    image: "/images/test-flat-lay.png"
  },
  {
    title: "تاقی ئەنجامی کوردی",
    url: "https://example.com/exam1",
    type: "exam",
    subject: "کوردی",
    track: "ئەدەبی",
    image: "/images/videos/physics-part1-thumb.jpg"
  }
]

const iconByType = {
  book: <BookOpen className="w-6 h-6 text-blue-600" />,
  booklet: <BookOpen className="w-6 h-6 text-violet-600" />,
  video: <Video className="w-6 h-6 text-red-500" />,
  exam: <FileText className="w-6 h-6 text-amber-600" />
}

const ContentDisplay = ({ filter, track }) => {
  const [subject, setSubject] = useState("")
  const [teacher, setTeacher] = useState("")

  const filteredProducts = sampleProducts.filter((item) => {
    if (item.type !== filter) return false
    if (track && item.track !== track) return false
    if (filter === "exam") return item.subject === subject
    return item.subject === subject && item.teacher === teacher
  })

  return (
    <div className="space-y-6 px-0 sm:px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-md border border-slate-100 animate-fadeIn">
            {/* Subject Dropdown */}
            <div className="w-full space-y-2">
                <label className="text-sm font-bold text-gray-700">📚 بابەت هەڵبژێرە</label>
                <select
                value={subject}
                onChange={(e) => {
                    setSubject(e.target.value)
                    setTeacher("")
                }}
                
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                <option value="">-- هەڵبژاردن --</option>
                {subjects.map((subj) => (
                    <option key={subj} value={subj}>
                    {subj}
                    </option>
                ))}
                </select>
            </div>

            {/* Teacher Dropdown */}
            {filter !== "exam" && subject && (
                <div
                className="w-full space-y-2 transition-all duration-300 ease-in-out animate-fadeIn"
                >
                <label className="text-sm font-bold text-gray-700">👨‍🏫 مامۆستا هەڵبژێرە</label>
                <select
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                    <option value="">-- هەڵبژاردن --</option>
                    {(teachersBySubject[subject] || []).map((t) => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                    ))}
                </select>
                </div>
            )}
            </div>

      {/* Product Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {filteredProducts.map((product, i) => (
            <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                key={i}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded-t-2xl"
                    />

                <div className="p-4 text-center space-y-1">
                    <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition">
                    {product.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                    {product.subject} {product.teacher && `– ${product.teacher}`}
                    </p>
                    {product.track && (
                    <p className="text-xs text-green-500">({product.track})</p>
                    )}
                </div>
                </a>

          ))}
        </div>
      ) : subject && (filter === "exam" || teacher) ? (
        <div className="text-center text-gray-400 text-sm mt-6">
          هیچ ناوەرۆک نەدۆزرایەوە 😔
        </div>
      ) : null}
    </div>
  )
}

export default ContentDisplay

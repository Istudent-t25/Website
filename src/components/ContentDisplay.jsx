import { useState } from "react"
import { BookOpen, Video, FileText } from "lucide-react"

const subjects = ["کوردی", "ئینگلیزی", "بیركاری", "فیزیا", "کیمیا", "ئەندازیارى"]

const teachersBySubject = {
  "کوردی": ["مامۆستا عومەر", "مامۆستا هێمن", "مامۆستا دڵشاد"],
  "ئینگلیزی": ["مامۆستا سارا", "مامۆستا ریبوار", "مامۆستا ژیار"],
  "بیركاری": ["مامۆستا ئارام", "مامۆستا ڕێژین"],
  "فیزیا": ["مامۆستا هوراز", "مامۆستا بەرزان"],
  "کیمیا": ["مامۆستا ناز", "مامۆستا زانیار"],
  "ئەندازیارى": ["مامۆستا رێبوار", "مامۆستا تارا"]
}

const sampleProducts = [
  {
    title: "کتێبی بیركاری پۆلی ١٢ - بەشی یەکەم",
    url: "https://example.com/math-book-12-part1",
    type: "book",
    subject: "بیركاری",
    teacher: "مامۆستا ئارام",
    track: "زانیاری",
    image: "https://placehold.co/400x250/50b2ed/ffffff?text=Math+Book"
  },
  {
    title: "ڤیدیۆی فیزیا پۆلی ١٢ - بەندی وزە",
    url: "https://youtube.com/physics-energy-video",
    type: "video",
    subject: "فیزیا",
    teacher: "مامۆستا هوراز",
    track: "زانیاری",
    image: "https://placehold.co/400x250/ef4444/ffffff?text=Physics+Video"
  },
  {
    title: "تاقی ئەنجامی کوردی پۆلی ٩",
    url: "https://example.com/kurdish-exam-9",
    type: "exam",
    subject: "کوردی",
    teacher: "", // Exams often don't have a specific teacher for filtering
    track: "گشتی",
    image: "https://placehold.co/400x250/f97316/ffffff?text=Kurdish+Exam"
  },
  {
    title: "کتێبی ئینگلیزی پۆلی ١٠ - گرامەر",
    url: "https://example.com/english-grammar-book",
    type: "book",
    subject: "ئینگلیزی",
    teacher: "مامۆستا سارا",
    track: "گشتی",
    image: "https://placehold.co/400x250/3b82f6/ffffff?text=English+Book"
  },
  {
    title: "ڤیدیۆی کیمیا پۆلی ١١ - کاردانەوەکان",
    url: "https://youtube.com/chemistry-reactions-video",
    type: "video",
    subject: "کیمیا",
    teacher: "مامۆستا ناز",
    track: "زانیاری",
    image: "https://placehold.co/400x250/a855f7/ffffff?text=Chemistry+Video"
  },
  {
    title: "تاقی ئەنجامی بیركاری پۆلی ١٢ - بەشی دووەم",
    url: "https://example.com/math-exam-12-part2",
    type: "exam",
    subject: "بیركاری",
    teacher: "",
    track: "زانیاری",
    image: "https://placehold.co/400x250/22c55e/ffffff?text=Math+Exam"
  },
  {
    title: "کتێبی کوردی پۆلی ٨ - نووسین",
    url: "https://example.com/kurdish-writing-book",
    type: "book",
    subject: "کوردی",
    teacher: "مامۆستا عومەر",
    track: "گشتی",
    image: "https://placehold.co/400x250/ec4899/ffffff?text=Kurdish+Book"
  },
  {
    title: "ڤیدیۆی ئەندازیارى پۆلی ١٢ - سێڕوویی",
    url: "https://youtube.com/engineering-3d-video",
    type: "video",
    subject: "ئەندازیارى",
    teacher: "مامۆستا رێبوار",
    track: "زانستی",
    image: "https://placehold.co/400x250/14b8a6/ffffff?text=Engineering+Video"
  },
  {
    title: "تاقی ئەنجامی ئینگلیزی پۆلی ١٠",
    url: "https://example.com/english-exam-10",
    type: "exam",
    subject: "ئینگلیزی",
    teacher: "",
    track: "گشتی",
    image: "https://placehold.co/400x250/fcd34d/000000?text=English+Exam"
  },
  {
    title: "کتێبی فیزیا پۆلی ١٠ - جووڵە",
    url: "https://example.com/physics-motion-book",
    type: "book",
    subject: "فیزیا",
    teacher: "مامۆستا هوراز",
    track: "زانیاری",
    image: "https://placehold.co/400x250/c026d3/ffffff?text=Physics+Book"
  },
  {
    title: "ڤیدیۆی کوردی پۆلی ٧ - چیرۆک",
    url: "https://youtube.com/kurdish-story-video",
    type: "video",
    subject: "کوردی",
    teacher: "مامۆستا هێمن",
    track: "گشتی",
    image: "https://placehold.co/400x250/fb7185/ffffff?text=Kurdish+Video"
  },
  {
    title: "تاقی ئەنجامی کیمیا پۆلی ١١",
    url: "https://example.com/chemistry-exam-11",
    type: "exam",
    subject: "کیمیا",
    teacher: "",
    track: "زانیاری",
    image: "https://placehold.co/400x250/60a5fa/ffffff?text=Chemistry+Exam"
  },
  {
    title: "کتێبی کیمیا پۆلی ١٢ - بەشی ئۆرگانی",
    url: "https://example.com/organic-chemistry-book",
    type: "book",
    subject: "کیمیا",
    teacher: "مامۆستا ناز",
    track: "زانیاری",
    image: "https://placehold.co/400x250/84cc16/ffffff?text=Organic+Chem"
  }
]

const iconByType = {
  book: <BookOpen className="w-6 h-6 text-blue-600" />,
  booklet: <BookOpen className="w-6 h-6 text-violet-600" />,
  video: <Video className="w-6 h-6 text-red-500" />,
  exam: <FileText className="w-6 h-6 text-amber-600" />
}

const ContentDisplay = ({ filter, track, search }) => { // Added search prop
  const [subject, setSubject] = useState("")
  const [teacher, setTeacher] = useState("")

  const filteredProducts = sampleProducts.filter((item) => {
    // Basic type and track filtering
    if (item.type !== filter) return false
    if (track && item.track !== track) return false

    // Subject and Teacher filtering based on item type
    if (filter === "exam") {
      if (subject && item.subject !== subject) return false;
    } else {
      if (subject && item.subject !== subject) return false;
      if (teacher && item.teacher !== teacher) return false;
    }

    // Search filtering (case-insensitive across multiple fields)
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      const itemTitle = item.title.toLowerCase();
      const itemSubject = item.subject.toLowerCase();
      const itemTeacher = item.teacher ? item.teacher.toLowerCase() : '';
      const itemTrack = item.track ? item.track.toLowerCase() : '';

      const matchesSearch =
        itemTitle.includes(lowerCaseSearch) ||
        itemSubject.includes(lowerCaseSearch) ||
        itemTeacher.includes(lowerCaseSearch) ||
        itemTrack.includes(lowerCaseSearch);

      if (!matchesSearch) return false;
    }

    return true;
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
            {filter !== "exam" && (
                <div
                className={`w-full space-y-2 transition-all duration-300 ease-in-out ${subject ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
                >
                <label className="text-sm font-bold text-gray-700">👨‍🏫 مامۆستا هەڵبژێرە</label>
                <select
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    disabled={!subject} // Disable if no subject is selected
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
      ) : (subject && (filter === "exam" || teacher)) || search ? (
        <div className="text-center text-gray-400 text-sm mt-6">
          هیچ ناوەرۆک نەدۆزرایەوە 😔
        </div>
      ) : null}
    </div>
  )
}

export default ContentDisplay

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "./../components/ui/card";
import { motion } from "framer-motion";
import {
  Book, Video, NotebookText, CalendarDays, Lightbulb, Bell, GraduationCap, Languages, Volume2
} from "lucide-react";

const Dashboard = () => {
  const todaySubjects = [
    { time: "08:00", subject: "بیركاری" },
    { time: "09:30", subject: "کوردی" },
    { time: "11:00", subject: "فیزیا" },
  ];

  const motivationalQuote = "هەرچەندە ڕێگا درێژ بێت، بەهێز بەرەوپێش دەچیت 🔥";

  const suggestions = [
    { icon: Languages, color: "text-blue-700", text: "گرامەری ئینگلیزی", type: "گرامەر" },
    { icon: Volume2, color: "text-green-700", text: "دەنگەکان", type: "دەنگەکان" },
    { icon: Lightbulb, color: "text-purple-700", text: "چۆن باشتر بخوێنین", type: "پەندەکان" },
  ];

  return (
    <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* Section: Choose Content */}
      <Card className="col-span-full bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">📚 چی ده‌خوازی</CardTitle>
          <CardDescription className="text-gray-600">کتێب، پەرتووک یان ڤیدیۆ هەڵبژێرە بۆ دەستپێکردن</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 bg-blue-200 hover:bg-blue-300 text-blue-900 font-bold py-4 rounded-xl transition">
            <Book /> کتێبەکان
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 bg-green-200 hover:bg-green-300 text-green-900 font-bold py-4 rounded-xl transition">
            <NotebookText /> مه‌لزه‌مه‌كان
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 bg-purple-200 hover:bg-purple-300 text-purple-900 font-bold py-4 rounded-xl transition">
            <Video /> ڤیدیۆکان
          </motion.button>
        </CardContent>
      </Card>

      {/* Section: Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap- text-blue-700"><CalendarDays size={20} />خشته‌ی ئه‌مرۆ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {todaySubjects.map((s, i) => (
            <div key={i} className="flex justify-between border-b pb-1">
              <span className="text-gray-800 font-medium">{s.subject}</span>
              <span className="text-gray-500">{s.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section: Motivation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600"><Lightbulb size={20} />وته‌ی ئه‌مرۆ</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 text-sm">
          <p>{motivationalQuote}</p>
        </CardContent>
      </Card>

      {/* Section: Upcoming Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500"><GraduationCap size={20} /> تاقیکردنەوەی داهاتوو</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-1">
          <p>📝 بیركاری - ٢٧ی ٥</p>
          <p>📝 زیدنه‌زانی - ٢٧ی ٥</p>
          <p>📝 كیمیا - ٢٧ی ٥</p>
          <p>📝 كوردی - ٢٩ی ٥</p>
        </CardContent>
      </Card>

      {/* Section: Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500"><Bell size={20} /> ئاگادارییەکان</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-1">
          <p>📌 کتێبی ماتماتیک زیادکرا</p>
          <p>📌 ڤیدیۆی تازەی فیزیا زیادکرا</p>
        </CardContent>
      </Card>

      {/* Section: Daily Study Tip */}
      <Card>
        <CardHeader>
          <CardTitle className="text-pink-600">📖 پەندی خوێندن</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p>تەنها ٣٠ خولەک خوێندن لە ڕۆژێک، دەتوانێت جیاوازی زۆر بكات.</p>
        </CardContent>
      </Card>

      {/* Section: Suggestions */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-violet-700">🧠 پێشنیارەکانی فێرکاری</CardTitle>
          <CardDescription className="text-gray-500">بابەتە گرنگەکان بۆ فێربوونی باشتر</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((s, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-lg transition">
              <s.icon size={28} className={`${s.color}`} />
              <div>
                <p className="font-semibold text-gray-800">{s.text}</p>
                <p className="text-xs text-gray-500">{s.type}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

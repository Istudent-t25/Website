import { useState, useRef, useEffect } from "react";
import { Download, Edit, Trash, PlusCircle, UserPlus, X, Image } from "lucide-react";

const defaultDays = ["شەممە", "یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی"];

const colorOptions = [
  { value: "#BBF7D0", text: "#166534", name: "سەوز" },
  { value: "#DBEAFE", text: "#1E40AF", name: "شین" },
  { value: "#EDE9FE", text: "#4C1D95", name: "مۆر" },
  { value: "#FEF9C3", text: "#854D09", name: "زەرد" },
  { value: "#FEE2E2", text: "#991B1B", name: "سوور" },
  { value: "#E0E7FF", text: "#3730A3", name: "نیلی" },
];

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colorOptions.length);
  return colorOptions[randomIndex];
};

const convertDayToEnglish = (kurdishDay) => {
  const map = {
    "شەممە": "Saturday",
    "یەکشەممە": "Sunday",
    "دووشەممە": "Monday",
    "سێشەممە": "Tuesday",
    "چوارشەممە": "Wednesday",
    "پێنجشەممە": "Thursday",
    "هەینی": "Friday"
  };
  return map[kurdishDay] || kurdishDay;
};
const convertDayToKurdish = (englishDay) => {
  const map = {
    "Saturday": "شەممە",
    "Sunday": "یەکشەممە",
    "Monday": "دووشەممە",
    "Tuesday": "سێشەممە",
    "Wednesday": "چوارشەممە",
    "Thursday": "پێنجشەممە",
    "Friday": "هەینی"
  };
  return map[englishDay] || englishDay;
};

const ScheduleApp = () => {
  const [users, setUsers] = useState(["بەکارهێنەر١"]);
  const [currentUser, setCurrentUser] = useState("بەکارهێنەر١");
  const [schedules, setSchedules] = useState({ "بەکارهێنەر١": {} });
  const [form, setForm] = useState({ day: "شەممە", time: "", subject: "", color: "", textColor: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token") || "");
  const [studentId, setStudentId] = useState(null);
  const scheduleCardsRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => setHtml2canvasLoaded(true);
    script.onerror = () => console.error("نەتوانرا html2canvas باربکرێت.");
    document.body.appendChild(script);

    const fetchStudentInfo = async () => {
      if (!accessToken) return;
      try {
        const res = await fetch("http://134.209.212.209:8000/student/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStudentId(data.id);
        } else {
          console.warn("Access token may be expired or invalid.");
        }
      } catch (err) {
        console.error("Failed to fetch student info", err);
      }
    };

    const fetchSchedules = async () => {
      try {
        const res = await fetch("http://134.209.212.209:8000/schedule/v1/schedule", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = {};
            data.forEach((item) => {
              const day = convertDayToKurdish(item.weekday);
              if (!mapped[day]) mapped[day] = [];
              mapped[day].push({
                subject: item.name,
                time: "",
                color: getRandomColor().value,
                textColor: getRandomColor().text,
              });
            });

            setSchedules(prev => ({
              ...prev,
              [currentUser]: mapped,
            }));

        } else {
          console.error("❌ Failed to fetch schedules.");
        }
      } catch (err) {
        console.error("❌ Error fetching schedules:", err);
      }
    };

    fetchStudentInfo();
    fetchSchedules();

    return () => {
      document.body.removeChild(script);
    };
  }, [accessToken]);

const handleAddSchedule = async () => {
  if (!form.subject) {
    alert("تکایە ناونیشان پڕبکەوە.");
    return;
  }

  const englishDay = convertDayToEnglish(form.day);

  const selectedColor = form.color
    ? colorOptions.find((c) => c.value === form.color)
    : getRandomColor();

  const userSchedule = schedules[currentUser] || {};
  const newDaySchedule = [...(userSchedule[form.day] || [])];
  const newEntry = {
    time: form.time,
    subject: form.subject,
    color: selectedColor.value,
    textColor: selectedColor.text,
  };

  if (editIndex !== null) {
    newDaySchedule[editIndex] = newEntry;
  } else {
    newDaySchedule.push(newEntry);
  }

  const updatedSchedules = {
    ...schedules,
    [currentUser]: {
      ...userSchedule,
      [form.day]: newDaySchedule,
    },
  };

  setSchedules(updatedSchedules);
  setForm({ day: "شەممە", time: "", subject: "", color: "", textColor: "" });
  setEditIndex(null);

  if (!studentId) return;

  try {
    const response = await fetch("http://134.209.212.209:8000/schedule/v1/schedule", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student: studentId,
        name: form.subject,
        description: form.subject,
        weekday: englishDay,
      }),
    });

    if (response.ok) {
      console.log("✅ Schedule saved to database.");
    } else {
      const error = await response.json();
      console.error("❌ Failed to save schedule:", error.detail || response.statusText);
    }
  } catch (error) {
    console.error("❌ Error submitting schedule:", error);
  }
};
  const handleEdit = (day, index) => {
    const entry = schedules[currentUser][day][index];
    setForm({ day, ...entry });
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (day, index) => {
    if (!window.confirm("دڵنیایت کە دەتەوێت ئەم تۆمارە بسڕیتەوە؟")) {
      return;
    }
    const newSchedule = [...schedules[currentUser][day]];
    newSchedule.splice(index, 1);
    setSchedules({
      ...schedules,
      [currentUser]: {
        ...schedules[currentUser],
        [day]: newSchedule,
      },
    });
  };

  const downloadScheduleAsImage = async () => {
    if (!html2canvasLoaded) {
      alert("تکایە چاوەڕێ بکە تا کتێبخانەی وێنە باردەکرێت.");
      return;
    }
    if (scheduleCardsRef.current) {
      const canvas = await window.html2canvas(scheduleCardsRef.current, {
        scale: 2,
        useCORS: true,
        windowWidth: scheduleCardsRef.current.scrollWidth,
        windowHeight: scheduleCardsRef.current.scrollHeight
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `${currentUser}_خشتە.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadSchedule = () => {
    let content = `خشتەی ${currentUser}\n\n`;
    defaultDays.forEach(day => {
      const entries = schedules[currentUser][day] || [];
      if (entries.length) {
        content += `--- ${day} ---\n`;
        entries.forEach(e => (content += ` - ${e.time || "کات دیارینەکراوە"}: ${e.subject}\n`));
        content += "\n";
      }
    });
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${currentUser}_خشتە.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addUser = () => {
    if (newUserName && !users.includes(newUserName)) {
      setUsers([...users, newUserName]);
      setSchedules({ ...schedules, [newUserName]: {} });
      setCurrentUser(newUserName);
      setNewUserName("");
      setIsAddingUser(false);
    } else if (newUserName) {
      alert("بەکارهێنەرەکە پێشتر هەیە یان ناوەکە بەتاڵە!");
    }
  };

  const handleColorChange = (e) => {
    const selectedColorValue = e.target.value;
    const selectedColor = colorOptions.find(c => c.value === selectedColorValue);
    setForm({
      ...form,
      color: selectedColor ? selectedColor.value : "",
      textColor: selectedColor ? selectedColor.text : "",
    });
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 antialiased">
      <div className="max-w-screen-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <header className="bg-indigo-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center rounded-t-3xl shadow-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-0">
            خشته‌ی هه‌فتانه‌
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative">
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="appearance-none bg-indigo-600 border border-indigo-500 text-white py-2 px-4 pr-8 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer transition duration-300 ease-in-out hover:bg-indigo-500"
              >
                {users.map((u) => (
                  <option key={u} value={u} className="bg-white text-gray-900">
                    {u}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {!isAddingUser ? (
              <button
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-400 transition duration-300 ease-in-out text-base"
              >
                <UserPlus size={20} /> زیادکردنی بەکارهێنەر
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ناوی بەکارهێنەری نوێ"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addUser();
                  }}
                  className="p-2 rounded-full border border-indigo-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-900 shadow-sm"
                />
                <button
                  onClick={addUser}
                  className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-400 transition duration-300 ease-in-out"
                  title="دڵنیاکردنەوەی زیادکردنی بەکارهێنەر"
                >
                  <PlusCircle size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsAddingUser(false);
                    setNewUserName("");
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-400 transition duration-300 ease-in-out"
                  title="هەڵوەشاندنەوەی زیادکردنی بەکارهێنەر"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <button
              onClick={downloadScheduleAsImage}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-500 transition duration-300 ease-in-out text-base"
            >
              <Image size={20} /> داگرتنی خشتە (وێنە)
            </button>
          </div>
        </header>

        <section className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editIndex !== null ? "دەستکاریکردنی تۆماری خشتە" : "زیادکردنی تۆماری خشتەی نوێ"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none transition duration-200 ease-in-out"
              >
                {defaultDays.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <input
              type="time"
              placeholder="کات (ئیختیاری)"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
            />
            <input
              type="text"
              placeholder="بابەت (پێویستە)"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
            />
            <div className="relative">
              <select
                value={form.color}
                onChange={handleColorChange}
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none transition duration-200 ease-in-out"
              >
                <option value="" className="text-gray-500">ڕەنگێک هەڵبژێرە (ئیختیاری)</option>
                {colorOptions.map((c) => (
                  <option key={c.value} value={c.value} style={{ backgroundColor: c.value, color: c.text }}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleAddSchedule}
              className="col-span-1 md:col-span-2 lg:col-span-1 bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold text-lg"
            >
              {editIndex !== null ? "نوێکردنەوەی خشتە" : "زیادکردنی خشتە"}
            </button>
          </div>
        </section>

        <section ref={scheduleCardsRef} className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-white">
          {defaultDays.map((day) => (
            <div
              key={day}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 space-y-4 transform hover:scale-102 transition duration-300 ease-in-out"
            >
              <h3 className="text-xl font-extrabold text-gray-900 border-b-2 border-indigo-200 pb-3 mb-3 text-center">
                {day}
              </h3>
              {(schedules[currentUser]?.[day] || []).length === 0 ? (
                <p className="text-gray-500 text-center py-4">هیچ خشتەیەک نییە بۆ ئەم ڕۆژە.</p>
              ) : (
                <div className="space-y-3">
                  {(schedules[currentUser][day] || []).map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm`}
                      style={{ backgroundColor: entry.color, color: entry.textColor }}
                    >
                      <div>
                        <div className="font-bold text-lg">{entry.subject}</div>
                        {entry.time && <div className="text-sm opacity-90">{entry.time}</div>}
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-0">
                        <button
                          onClick={() => handleEdit(day, idx)}
                          className="p-2 rounded-full hover:bg-white/30 transition duration-200 ease-in-out"
                          title="دەستکاری"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(day, idx)}
                          className="p-2 rounded-full hover:bg-white/30 transition duration-200 ease-in-out"
                          title="سڕینەوە"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ScheduleApp;
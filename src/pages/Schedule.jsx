import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Edit, Trash, Calendar as CalendarIcon, ListTodo, GraduationCap, X, Bell } from 'lucide-react';

// Define default days in Kurdish, starting from Sunday for consistency with JS getDay()
const defaultDays = ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "شەممە"];

// Event color configurations for one-time events
const eventColors = {
  general: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  exam: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  task: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  note: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
};

// --- Generic Modal Component ---
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200 text-gray-600"
          title="داخستن"
        >
          <X size={20} />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-400 pb-3 text-center">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
};

// --- Recurring Schedule Modal Component ---
const RecurringScheduleModal = ({ isOpen, onClose, onSave, initialData, defaultDays }) => {
  const [form, setForm] = useState(initialData || { day: 'یەکشەممە', time: '', subject: '' });
  const [editId, setEditId] = useState(initialData?.id || null);

  useEffect(() => {
    setForm(initialData || { day: 'یەکشەممە', time: '', subject: '' });
    setEditId(initialData?.id || null);
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject) {
      // Replaced alert with a custom message approach for better UX in a web app
      // In a real application, you'd use a state variable to show an error message in the UI.
      console.error("تکایە ناونیشان پڕبکەوە.");
      return;
    }
    onSave(form, editId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? "دەستکاریکردنی وانەی هەفتانە" : "زیادکردنی وانەی هەفتانە"}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <select
            name="day"
            value={form.day}
            onChange={handleChange}
            className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none transition duration-200 ease-in-out bg-white text-gray-800 text-base pl-8"
          >
            {defaultDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <input
          type="time"
          name="time"
          placeholder="کات (ئیختیاری)"
          value={form.time}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-right text-gray-800 text-base"
        />
        <input
          type="text"
          name="subject"
          placeholder="بابەت (پێویستە)"
          value={form.subject}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-right text-gray-800 text-base"
          required
        />
        <button
          type="submit"
          className="col-span-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:scale-105 font-bold text-lg mt-4"
        >
          {editId ? "نوێکردنەوەی وانە" : "زیادکردنی وانە"}
        </button>
      </form>
    </Modal>
  );
};


// --- Main Scheduleapp Component ---
const Scheduleapp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('dashboardCalendarEvents');
    return savedEvents ? JSON.parse(savedEvents) : {};
  });
  const [weeklyRecurringItems, setWeeklyRecurringItems] = useState(() => {
    const savedRecurring = localStorage.getItem('dashboardWeeklyRecurringItems');
    return savedRecurring ? JSON.parse(savedRecurring) : {};
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0], // Default form date to today
    time: '',
    title: '',
    type: 'general'
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // For one-time events
  const [editEventId, setEditEventId] = useState(null);

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false); // For recurring schedules
  const [editRecurringData, setEditRecurringData] = useState(null);

  // Save events and recurring items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardCalendarEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('dashboardWeeklyRecurringItems', JSON.stringify(weeklyRecurringItems));
  }, [weeklyRecurringItems]);


  // Update form date when selectedDate changes in calendar
  useEffect(() => {
    if (selectedDate) {
      setForm(prevForm => ({
        ...prevForm,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    const startDay = firstDayOfMonth.getDay(); // 0 for Sunday
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const goToPrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // --- One-Time Event Handlers ---
  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(day);
      const dateString = day.toISOString().split('T')[0];
      setForm({
        date: dateString,
        time: '',
        title: '',
        type: 'general'
      });
      setIsFormModalOpen(true); // Open event modal on day click
      setEditEventId(null);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      console.error("تکایە ناونیشان و بەروار پڕبکەوە."); // Use console.error instead of alert
      return;
    }

    const eventDateKey = form.date;
    const newEvent = {
      id: editEventId || Date.now(),
      title: form.title,
      time: form.time,
      type: form.type,
    };

    setEvents(prevEvents => {
      const updatedEvents = { ...prevEvents };
      if (!updatedEvents[eventDateKey]) {
        updatedEvents[eventDateKey] = [];
      }

      if (editEventId) {
        updatedEvents[eventDateKey] = updatedEvents[eventDateKey].map(event =>
          event.id === editEventId ? newEvent : event
        );
      } else {
        updatedEvents[eventDateKey].push(newEvent);
      }
      return updatedEvents;
    });

    // Reset form and close it
    setForm({ date: '', time: '', title: '', type: 'general' });
    setIsFormModalOpen(false);
    setEditEventId(null);
  };

  const handleEditEvent = (dateKey, eventId) => {
    const eventToEdit = events[dateKey]?.find(event => event.id === eventId);
    if (eventToEdit) {
      setSelectedDate(new Date(dateKey)); // Set selected date to the event's date
      setForm({
        date: dateKey,
        time: eventToEdit.time,
        title: eventToEdit.title,
        type: eventToEdit.type,
      });
      setEditEventId(eventId);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteEvent = (dateKey, eventId) => {
    // Replaced window.confirm with a custom message in console, as window.confirm is not ideal in a real app
    console.warn("دڵنیایت کە دەتەوێت ئەم تۆمارە بسڕیتەوە؟ (Confirmation in console for now)");
    // In a real application, you'd use a custom modal for user confirmation.
    
    setEvents(prevEvents => {
      const updatedEvents = { ...prevEvents };
      updatedEvents[dateKey] = updatedEvents[dateKey]?.filter(event => event.id !== eventId);
      if (updatedEvents[dateKey]?.length === 0) {
        delete updatedEvents[dateKey];
      }
      return updatedEvents;
    });
  };

  // --- Recurring Schedule Handlers ---
  const handleOpenRecurringModal = (data = null) => {
    setEditRecurringData(data);
    setIsRecurringModalOpen(true);
  };

  const handleSaveRecurringItem = (itemData, editId) => {
    setWeeklyRecurringItems(prevItems => {
      const updatedItems = { ...prevItems };
      if (!updatedItems[itemData.day]) {
        updatedItems[itemData.day] = [];
      }

      const newItem = { ...itemData, id: editId || Date.now() };

      if (editId) {
        // Find the specific item and update it
        updatedItems[itemData.day] = updatedItems[itemData.day].map(item =>
          item.id === editId ? newItem : item
        );
      } else {
        // Add new item
        updatedItems[itemData.day].push(newItem);
      }
      return updatedItems;
    });
  };

  const handleDeleteRecurringItem = (day, itemId) => {
    console.warn("دڵنیایت کە دەتەوێت ئەم وانە دووبارەبووە بسڕیتەوە؟ (Confirmation in console for now)");
    // In a real application, you'd use a custom modal for user confirmation.
    setWeeklyRecurringItems(prevItems => {
      const updatedItems = { ...prevItems };
      updatedItems[day] = updatedItems[day].filter(item => item.id !== itemId);
      if (updatedItems[day].length === 0) {
        delete updatedItems[day];
      }
      return updatedItems;
    });
  };


  const selectedDayEvents = selectedDate ? events[selectedDate.toISOString().split('T')[0]] || [] : [];

  const upcomingExams = Object.keys(events)
    .flatMap(dateKey =>
      events[dateKey].filter(event => event.type === 'exam' && new Date(dateKey) >= new Date())
                     .map(event => ({ ...event, dateKey }))
    )
    .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey))
    .slice(0, 5); // Show next 5 upcoming exams

  return (
    // Outer container: full screen height and width, no scroll on the main window.
    // Flex column layout to distribute vertical space among header and main content.
    <div dir="rtl" className="h-screen w-screen flex flex-col items-center antialiased overflow-hidden p-4 sm:p-1">
      {/* Inner container: takes full available space, also flex column to manage header and main */}
      <div className="w-full h-full flex flex-col rounded-3xl shadow-2xl ring-1 ring-blue-100 bg-gray-50">
        <header className="text-black p-6 sm:p-2 flex flex-col sm:flex-row justify-between items-center rounded-t-3xl shadow-lg mb-4 mx-auto w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-3xl sm:text-3xl font-extrabold drop-shadow-lg tracking-wide mb-2 sm:mb-0">
            <CalendarIcon size={35} className="inline-block ml-2 text-white" /> خشتەی ژیانی من
          </h1>
          <button
            onClick={() => { setIsFormModalOpen(true); setEditEventId(null); setForm({ date: selectedDate.toISOString().split('T')[0], time: '', title: '', type: 'general' }); }}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 font-medium text-base tracking-wide"
          >
            <PlusCircle size={20} /> زیادکردنی بۆنە
          </button>
        </header>
        {/* Main content area: takes remaining vertical space, grid for layout */}
        <main className="p-4 sm:p-4 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-b-3xl overflow-hidden">
          {/* Calendar section */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-4 border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b-2 border-blue-300 pb-2 flex-shrink-0">
              <button onClick={goToNextMonth} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200 ease-in-out">
                <ChevronRight size={24} className="text-gray-700" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800">
                {currentDate.toLocaleString('ckb-IQ', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={goToPrevMonth} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200 ease-in-out">
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 text-sm mb-4 flex-shrink-0">
              {defaultDays.map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            {/* Calendar days grid: allows individual day content to overflow but the grid itself fits */}
            <div className="grid grid-cols-7 gap-1 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`p-1 rounded-lg cursor-pointer transition duration-150 ease-in-out flex flex-col items-center relative
                              ${day ? 'hover:bg-blue-50' : 'bg-gray-50 cursor-default'}
                              ${day && selectedDate && day.toDateString() === selectedDate.toDateString() ? 'bg-blue-100 ring-2 ring-blue-400' : ''}
                              ${day && day.toDateString() === new Date().toDateString() ? 'border-2 border-purple-500 font-bold text-purple-700' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className={`font-semibold text-base z-10 ${day && day.toDateString() === new Date().toDateString() ? 'text-purple-700' : 'text-gray-800'}`}>
                    {day ? day.getDate() : ''}
                  </span>
                  {day && events[day.toISOString().split('T')[0]] && (
                    <div className="mt-0.5 space-y-0.5 w-full text-right z-10">
                      {events[day.toISOString().split('T')[0]].slice(0, 1).map(event => ( // Show max 1 event
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded-sm whitespace-nowrap overflow-hidden text-ellipsis
                                      ${eventColors[event.type]?.bg} ${eventColors[event.type]?.text}`}
                          title={`${event.time ? event.time + ' - ' : ''}${event.title}`}
                        >
                          {event.time && <span className="ml-1">{event.time}</span>}
                          {event.title}
                        </div>
                      ))}
                      {events[day.toISOString().split('T')[0]].length > 1 && (
                        <div className="text-xs text-gray-500 mt-0.5">... زیاتر</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Events, Weekly Schedule, Exams - Now using flex-grow for vertical distribution */}
          <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden">
            {/* Selected Date Events List */}
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-blue-400 pb-3 flex-shrink-0">
                بۆنەکانی: {selectedDate?.toLocaleDateString('ckb-IQ') || new Date().toLocaleDateString('ckb-IQ')}
              </h3>
              {/* Content list: now uses overflow-y-auto to manage its own scroll if necessary */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm italic">هیچ بۆنەیەک نییە بۆ ئەم ڕۆژە.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map(event => (
                      <div key={event.id}
                        className={`p-3 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition duration-200 ease-in-out
                                    ${eventColors[event.type]?.bg} ${eventColors[event.type]?.text}`}>
                        <div>
                          <div className="font-semibold text-base">{event.title}</div>
                          {event.time && <div className="text-sm opacity-90">{event.time}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(selectedDate.toISOString().split('T')[0], event.id)}
                            className="p-1.5 rounded-full hover:bg-white/30 transition duration-200 ease-in-out"
                            title="دەستکاری"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(selectedDate.toISOString().split('T')[0], event.id)}
                            className="p-1.5 rounded-full hover:bg-white/30 transition duration-200 ease-in-out"
                            title="سڕینەوە"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Weekly Schedule Section - Now Dynamic */}
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-purple-400 pb-3 flex justify-between items-center flex-shrink-0">
                <span><ListTodo size={24} className="inline-block ml-2 text-purple-600" /> خشتەی هەفتانە</span>
                <button
                  onClick={() => handleOpenRecurringModal()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition duration-200 ease-in-out shadow-md"
                >
                  <PlusCircle size={16} className="inline-block ml-1" /> زیادکردنی وانەی هەفتانە
                </button>
              </h3>
              {/* Content list: now uses overflow-y-auto to manage its own scroll if necessary */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                <div className="space-y-4">
                  {defaultDays.map(day => (
                    <div key={day} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <h4 className="font-semibold text-lg text-gray-700 mb-2">{day}</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {(weeklyRecurringItems[day] || []).length > 0 ? (
                          weeklyRecurringItems[day].map((item, idx) => (
                            <li key={item.id} className="flex items-center justify-between group p-1.5 rounded-md hover:bg-gray-50 transition duration-200 ease-in-out">
                              <span className="flex items-center">
                                  <span className="ml-2 text-purple-400">•</span> {item.time && <span className="mr-2 font-medium">{item.time} - </span>}{item.subject}
                              </span>
                              <span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                      onClick={() => handleOpenRecurringModal({ ...item, day })}
                                      className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                                      title="دەستکاری"
                                  >
                                      <Edit size={14} />
                                  </button>
                                  <button
                                      onClick={() => handleDeleteRecurringItem(day, item.id)}
                                      className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                                      title="سڕینەوە"
                                  >
                                      <Trash size={14} />
                                  </button>
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">هیچ شتێک دیارینەکراوە.</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Upcoming Exams Section */}
            <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-red-400 pb-3 flex-shrink-0">
                <GraduationCap size={24} className="inline-block ml-2 text-red-600" /> تاقیکردنەوە داهاتووەکان
              </h3>
              {/* Content list: now uses overflow-y-auto to manage its own scroll if necessary */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {upcomingExams.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm italic">هیچ تاقیکردنەوەیەکی داهاتوو نییە.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingExams.map(event => (
                      <div key={event.id}
                        className={`p-3 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition duration-200 ease-in-out
                                    ${eventColors[event.type]?.bg} ${eventColors[event.type]?.text}`}>
                        <div>
                          <div className="font-semibold text-base">
                            <span className="ml-2 text-red-500"><Bell size={18} className="inline-block" /></span>
                            {event.title}
                          </div>
                          <div className="text-sm opacity-90 mt-1">
                            بەروار: {new Date(event.dateKey).toLocaleDateString('ckb-IQ')}
                            {event.time && <span className="mr-4"> کات: {event.time}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event.dateKey, event.id)}
                            className="p-1.5 rounded-full hover:bg-white/30 transition duration-200 ease-in-out"
                            title="دەستکاری"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.dateKey, event.id)}
                            className="p-1.5 rounded-full hover:bg-white/30 transition duration-200 ease-in-out"
                            title="سڕینەوە"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        {/* One-Time Event Form Modal */}
        <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditEventId(null); setForm({ date: selectedDate.toISOString().split('T')[0], time: '', title: '', type: 'general' }); }} title={editEventId ? "دەستکاریکردنی بۆنە" : "زیادکردنی بۆنەی نوێ"}>
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-right text-gray-800 text-base"
              required
            />
            <input
              type="time"
              name="time"
              placeholder="کات (ئیختیاری)"
              value={form.time}
              onChange={handleFormChange}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-right text-gray-800 text-base"
            />
            <input
              type="text"
              name="title"
              placeholder="ناونیشانی بۆنە (پێویستە)"
              value={form.title}
              onChange={handleFormChange}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-right text-gray-800 text-base"
              required
            />
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none transition duration-200 ease-in-out bg-white text-gray-800 text-base pl-8"
              >
                <option value="general">گشتی</option>
                <option value="exam">تاقیکردنەوە</option>
                <option value="task">کار</option>
                <option value="note">تێبینی</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="col-span-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:scale-105 font-bold text-lg mt-4"
            >
              {editEventId ? "نوێکردنەوەی بۆنە" : "زیادکردنی بۆنە"}
            </button>
          </form>
        </Modal>

        {/* Recurring Schedule Form Modal */}
        <RecurringScheduleModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          onSave={handleSaveRecurringItem}
          initialData={editRecurringData}
          defaultDays={defaultDays}
        />
      </div>
    </div>
  );
};

export default Scheduleapp;

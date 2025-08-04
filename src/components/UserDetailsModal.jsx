import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, onSaveDetails, studentId }) => {
  const [grade, setGrade] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth
  const [error, setError] = useState(''); // State for displaying errors
  const [loading, setLoading] = useState(false); // State for loading indicator

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!grade || !gender || !dob) {
      setError('تکایە هەموو خانەکان پڕ بکەرەوە.'); // Please fill in all fields.
      return;
    }

    setLoading(true); // Start loading

    try {
      // Assuming the API endpoint for updating student details is PUT /student/v1/student/{studentId}
      const response = await fetch(`http://134.209.212.209:8000/student/v1/student/${studentId}`, {
        method: 'PUT', // Use PUT for updating an existing resource
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: parseInt(grade), // Ensure grade is an integer if your API expects it
          gender: gender,
          dob: dob,
        }),
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) { // Check if the response status is 2xx (success)
        console.log("User details updated successfully:", data);
        if (onSaveDetails) {
          onSaveDetails({ grade, gender, dob }); // Pass the updated details to the parent
        }
        onClose(); // Close modal after successful saving
      } else {
        // Handle API errors
        setError(data.message || 'هەڵەی پاشەکەوتکردنی زانیاری. تکایە دووبارە هەوڵبدەرەوە.'); // Error saving details. Please try again.
        console.error("Failed to update user details:", data);
      }
    } catch (apiError) {
      console.error("API error during user details update:", apiError);
      setError("کێشەیەک ڕوویدا لە کاتی پاشەکەوتکردندا. تکایە دووبارە هەوڵبدەرەوە."); // An error occurred during saving. Please try again.
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          disabled={loading} // Disable close button while loading
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">زانیاری زیاتر</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">تکایە زانیارییەکانت پڕ بکەرەوە بۆ تەواوکردنی تۆمارکردن.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-right" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1 text-right">پۆل</label>
            <select
              id="grade"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-right"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
              disabled={loading} // Disable input while loading
              dir="rtl"
            >
              <option value="">هەڵبژێرە</option>
              <option value="7">پۆلی ٧</option>
              <option value="8">پۆلی ٨</option>
              <option value="9">پۆلی ٩</option>
              <option value="10">پۆلی ١٠</option>
              <option value="11">پۆلی ١١</option>
              <option value="12">پۆلی ١٢</option>
            </select>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1 text-right">ڕەگەز</label>
            <select
              id="gender"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-right"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              disabled={loading} // Disable input while loading
              dir="rtl"
            >
              <option value="">هەڵبژێرە</option>
              <option value="male">نێر</option>
              <option value="female">مێ</option>
              <option value="other">تر</option>
            </select>
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1 text-right">ڕێکەوتی لەدایکبوون</label>
            <input
              type="date"
              id="dob"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-right"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              disabled={loading} // Disable input while loading
              dir="rtl"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition duration-200 shadow-md mt-6"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save size={20} />
            )}
            {loading ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوت کردن'} {/* Saving... / Save */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsModal;

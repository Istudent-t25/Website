import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState(''); // State for grade
  const [gender, setGender] = useState(''); // State for gender
  const [dob, setDob] = useState(''); // State for date of birth
  const [error, setError] = useState(''); // State for displaying registration errors
  const [loading, setLoading] = useState(false); // State for loading indicator

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Basic client-side validation
    if (password !== confirmPassword) {
      setError('وشە نهێنییەکان وەک یەک نین!'); // Passwords do not match!
      return;
    }
    if (!name || !email || !password || !grade || !gender || !dob) {
      setError('تکایە هەموو خانەکان پڕ بکەرەوە.'); // Please fill in all fields.
      return;
    }

    setLoading(true); // Start loading indicator

    try {
      // API call to your registration endpoint
      const response = await fetch('http://134.209.212.209:8000/student/v1/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          grade: parseInt(grade), // Ensure grade is an integer for the API
          gender: gender,
          dob: dob,
          avatar: "default_avatar.png" // Assuming a default avatar is required
        }),
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) { // Check if the response status is successful (2xx)
        console.log("Registration successful:", data);
        if (onSignupSuccess) {
          onSignupSuccess(data); // Pass the API response data to the parent component (App.jsx)
        }
        onClose(); // Close the modal on successful registration
      } else {
        // Handle API errors (e.g., duplicate email, invalid data)
        setError(data.message || 'هەڵەی تۆمارکردن. تکایە دووبارە هەوڵبدەرەوە.'); // Generic error message if API doesn't provide one
        console.error("Registration failed:", data);
      }
    } catch (apiError) {
      // Handle network errors or other unexpected issues
      console.error("Registration API error:", apiError);
      setError("کێشەیەک ڕوویدا لە کاتی تۆمارکردندا. تکایە دووبارە هەوڵبدەرەوە."); // General error message for API call failure
    } finally {
      setLoading(false); // Stop loading indicator regardless of success or failure
    }
  };

  return (
    // Modal overlay: fixed position, semi-transparent black background, centered content
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Modal content container: white background, rounded corners, shadow, responsive width */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative transform scale-95 animate-scale-up">
        {/* Close button: absolute positioning, subtle styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-all duration-300 p-2 rounded-full hover:bg-gray-100"
          disabled={loading} // Disable close button while API call is in progress
        >
          <X size={24} />
        </button>
        {/* Modal title */}
        <h2 className="text-3xl font-extrabold text-green-700 mb-7 text-center">خۆت تۆمار بکە</h2>
        
        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-right transition-all duration-300 ease-in-out transform scale-y-100 origin-top" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Input field for Name */}
          <div>
            <label htmlFor="registerName" className="block text-sm font-medium text-gray-700 mb-1 text-right">ناو</label>
            <input
              type="text"
              id="registerName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out placeholder-gray-400"
              placeholder="ناوەکەت داخڵ بکە"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              dir="rtl" // Right-to-left text direction for Kurdish
            />
          </div>
          
          {/* Input field for Email */}
          <div>
            <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1 text-right">ئیمەیڵ</label>
            <input
              type="email"
              id="registerEmail"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out placeholder-gray-400"
              placeholder="ئیمەیڵەکەت داخڵ بکە"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              dir="rtl"
            />
          </div>
          
          {/* Input field for Password */}
          <div>
            <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1 text-right">وشەی نهێنی</label>
            <input
              type="password"
              id="registerPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out placeholder-gray-400"
              placeholder="وشەی نهێنیت داخڵ بکە"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              dir="rtl"
            />
          </div>
          
          {/* Input field for Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 text-right">دوبارە وشەی نهێنی</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out placeholder-gray-400"
              placeholder="دوبارە وشەی نهێنی داخڵ بکە"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              dir="rtl"
            />
          </div>
          
          {/* Select field for Grade */}
          <div>
            <label htmlFor="registerGrade" className="block text-sm font-medium text-gray-700 mb-1 text-right">پۆل</label>
            <select
              id="registerGrade"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
              disabled={loading}
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
          
          {/* Select field for Gender */}
          <div>
            <label htmlFor="registerGender" className="block text-sm font-medium text-gray-700 mb-1 text-right">ڕەگەز</label>
            <select
              id="registerGender"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              disabled={loading}
              dir="rtl"
            >
              <option value="">هەڵبژێرە</option>
              <option value="male">نێر</option>
              <option value="female">مێ</option>
              <option value="other">تر</option>
            </select>
          </div>
          
          {/* Input field for Date of Birth */}
          <div>
            <label htmlFor="registerDob" className="block text-sm font-medium text-gray-700 mb-1 text-right">ڕێکەوتی لەدایکبوون</label>
            <input
              type="date"
              id="registerDob"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-right transition-all duration-200 ease-in-out"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              disabled={loading}
              dir="rtl"
            />
          </div>

          {/* Submit button with loading indicator */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300 shadow-md transform hover:scale-105 active:scale-95 mt-6"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <UserPlus size={20} />
            )}
            {loading ? 'چاوەڕوان بە...' : 'خۆت تۆمار بکە'}
          </button>
        </form>

        {/* Link to switch to Login */}
        <p className="text-center text-sm text-gray-600 mt-5">
          پێشتر هەژمارت هەیە؟{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:underline font-medium transition-colors duration-200"
            disabled={loading}
          >
            چونەژوورەوە
          </button>
        </p>
      </div>
      {/* Custom Tailwind CSS animations for modal */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default RegisterModal;

import React, { useState ,useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
// Import your components and pages
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import ExamsGrade12 from './pages/ExamsGrade12';
import Schedule from './pages/Schedule';
import LoginModal from './components/LoginModal'; // Assuming you have this component
import RegisterModal from './components/RegisterModal';
import UserDetailsModal from './components/UserDetailsModal';
import SoundsPage from './pages/Sounds';
import GrammarPage from './pages/Grammers';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [user, setUser] = useState(null); // Will hold { id, name, email, grade, gender, dob, ... }
  const [registeredStudentId, setRegisteredStudentId] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || '');
  const closeModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowUserDetailsModal(false);
  };

  /**
   * Opens the Login Modal and closes others.
   */
  const openLoginModal = () => {
    closeModal(); // Close any currently open modals
    setShowLoginModal(true);
    setSidebarOpen(false); // Close sidebar if open
  };

  /**
   * Opens the Register Modal and closes others.
   */
  const openRegisterModal = () => {
    closeModal(); // Close any currently open modals
    setShowRegisterModal(true);
    setSidebarOpen(false); // Close sidebar if open
  };

  /**
   * Opens the User Details Modal and closes others.
   * This is typically called after a successful registration.
   */
  const openUserDetailsModal = () => {
    closeModal(); // Close any currently open modals
    setShowUserDetailsModal(true);
    setSidebarOpen(false); // Close sidebar if open
  };

  /**
   * Handles user logout.
   */
 const handleLogout = () => {
  localStorage.removeItem('access_token');
  setAccessToken('');
  setUser(null);
  setRegisteredStudentId(null);
  console.log("User logged out");
};


  /**
   * Callback function passed to RegisterModal.
   * Called when a user successfully registers.
   * @param {object} userData - The data returned from the registration API, expected to contain an 'id'.
   */
  const handleSignupSuccess = (userData) => {
    console.log("Signup successful in App.jsx:", userData);
    // Extract the student ID from the API response.
    // Adjust 'userData.id' or 'userData.studentId' based on your actual API response structure.
    const studentId = userData.id || userData.studentId;

    if (studentId) {
      setRegisteredStudentId(studentId); // Store the ID for UserDetailsModal
      openUserDetailsModal(); // Proceed to open the UserDetailsModal
    } else {
      console.error("Student ID not found in registration response:", userData);
      // Handle cases where the ID is missing (e.g., show an error to the user)
      // You might want to keep the register modal open with an error or show a general error message.
      closeModal(); // Close modals if ID is not found to prevent hanging
    }
  };

  /**
   * Callback function passed to UserDetailsModal.
   * Called when a user successfully saves their additional details.
   * @param {object} details - The grade, gender, and dob details saved by the user.
   */
  const handleSaveUserDetails = (details) => {
    console.log("User details saved in App.jsx:", details);
    // Here, you would typically update your main user state with these details
    // and potentially mark the user as fully registered/logged in.
    // For mock purposes, we'll set a mock user object.
    setUser({
      id: registeredStudentId, // Use the ID from registration
      name: "New User", // You might fetch the name again or pass it from RegisterModal
      ...details, // Add the new details (grade, gender, dob)
    });
    setRegisteredStudentId(null); // Clear the registered student ID
    closeModal(); // Close the user details modal
    // TODO: You might want to redirect the user to a dashboard or show a success message here.
  };
useEffect(() => {
  const fetchUser = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch('http://134.209.212.209:8000/student/v1/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Client-Type': 'student',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('✅ Logged in as:', userData.name || userData.email);
      } else if (response.status === 401) {
        // Token expired or invalid
        console.warn('Access token expired or invalid.');
        localStorage.removeItem('access_token');
        setAccessToken('');
        setUser(null);
      } else {
        // Other server errors
        const errData = await response.json();
        console.error('Unexpected error:', errData.detail || response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error.message);
    }
  };

  fetchUser();
}, [accessToken]);


  return (
    // Set text direction to right-to-left for Kurdish language
    <div dir="rtl" className="flex min-h-screen  bg-gray-100 text-gray-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user} // Pass user state to sidebar
        onLogout={handleLogout}
        openLoginModal={openLoginModal}
        openRegisterModal={openRegisterModal}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Header component: includes menu toggle for sidebar */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main content area, scrollable for page content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* React Router for page navigation */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students/:grade" element={<Students />} />
            <Route path="/exams/grade12" element={<ExamsGrade12 />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/sounds" element={<SoundsPage />} />
            <Route path="/grammar/:lang" element={<GrammarPage />} />
            {/* Fallback route for unmatched paths */}
            <Route path="*" element={<p className="text-center text-red-500">هەڵە: پەڕە نەدۆزرایەوە</p>} />
          </Routes>
        </main>
      </div>

     <LoginModal
  isOpen={showLoginModal}
  onClose={closeModal}
  onSwitchToRegister={openRegisterModal}
  onLoginSuccess={({ accessToken }) => {
    localStorage.setItem('access_token', accessToken);
    setAccessToken(accessToken);
    closeModal();
  }}
/>


      {/* Register Modal: shown when showRegisterModal is true */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={closeModal}
        onSwitchToLogin={openLoginModal} // Allows switching to login modal
        onSignupSuccess={handleSignupSuccess} // Crucial prop for chaining to UserDetailsModal
      />

      {/* User Details Modal: shown when showUserDetailsModal is true, typically after registration */}
      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={closeModal}
        onSaveDetails={handleSaveUserDetails} // Callback for saving details
        studentId={registeredStudentId} // Pass the ID of the newly registered student
      />
    </div>
  );
}

export default App;

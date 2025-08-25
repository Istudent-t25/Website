import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({
  children,
  isAuthenticated,
  openLoginModal,
  warningMessage = 'بۆ بینینی ئەم پەڕەیە پێویستە بچیتە ژوورەوە.'
}) => {
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal(warningMessage);
    }
  }, [isAuthenticated, openLoginModal, warningMessage]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default ProtectedRoute;

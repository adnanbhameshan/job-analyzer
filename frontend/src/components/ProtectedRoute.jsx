import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userString = localStorage.getItem('userInfo');
  const isAuthenticated = !!userString;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

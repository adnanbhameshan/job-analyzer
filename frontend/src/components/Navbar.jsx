import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const Navbar = () => {
  const navigate = useNavigate();
  // Using simple localStorage check for top-level toggle. API handles secure JWT.
  const userString = localStorage.getItem('userInfo');
  const user = userString ? JSON.parse(userString) : null;
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
        console.error("Logout failed", err);
    }
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trackr
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Dashboard</Link>
                <Link to="/jobs" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Jobs</Link>
                <Link to="/jobs/add" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors">
                  Add Job
                </Link>
                <div className="border-l border-slate-300 h-6 mx-2"></div>
                <span className="text-slate-500 font-medium text-sm">Hi, {user.name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-rose-600 font-medium text-sm ml-2 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

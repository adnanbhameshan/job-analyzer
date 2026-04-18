import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import JobForm from './pages/JobForm';
import JobList from './pages/JobList';
import AiAnalyzer from './pages/AiAnalyzer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<ProtectedRoute><JobList /></ProtectedRoute>} />
            <Route path="/jobs/add" element={<ProtectedRoute><JobForm /></ProtectedRoute>} />
            <Route path="/jobs/edit/:id" element={<ProtectedRoute><JobForm /></ProtectedRoute>} />
            <Route path="/ai-analyzer" element={<ProtectedRoute><AiAnalyzer /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

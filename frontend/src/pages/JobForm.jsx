import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { LinkIcon } from 'lucide-react';

const JobForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    source: 'manual',
    jobLink: '',
    isImported: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && location.state?.job) {
      setFormData(location.state.job);
    } else if (isEditMode) {
      const fetchJob = async () => {
        try {
          const { data } = await apiClient.get(`/jobs`);
          const job = data.find(j => j._id === id);
          if (job) setFormData(job);
        } catch (err) {
          console.error(err);
        }
      };
      fetchJob();
    }
  }, [isEditMode, id, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLinkImport = () => {
    if (!formData.jobLink) return;

    setLoading(true);
    setTimeout(() => {
      let company = 'Unknown Company';
      let role = 'Software Engineer';
      let source = 'manual';

      try {
        const url = new URL(formData.jobLink);
        if (url.hostname.includes('linkedin.com')) {
          company = 'LinkedIn Recruiter Corp';
          role = 'Senior Frontend Engineer';
          source = 'linkedin';
        } else if (url.hostname.includes('naukri.com')) {
          company = 'Naukri Recruiter Inc';
          role = 'Full Stack Developer';
          source = 'naukri';
        } else {
          company = url.hostname.replace('www.', '').split('.')[0];
          company = company.charAt(0).toUpperCase() + company.slice(1);
          role = 'Software Developer';
        }
      } catch (e) {
        // Invalid URL handled passively
      }

      setFormData({
        ...formData,
        company,
        role,
        source,
        isImported: true
      });
      setLoading(false);
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await apiClient.put(`/jobs/${id}`, formData);
      } else {
        await apiClient.post('/jobs', formData);
      }
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          {isEditMode ? 'Edit Job Application' : 'Add New Application'}
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-700 font-semibold transition"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {!isEditMode && (
          <div className="mb-8 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-indigo-900 mb-1.5 flex items-center gap-2">
                <LinkIcon size={16} /> Quick Import from Job URL
              </label>
              <input 
                type="url" 
                name="jobLink"
                placeholder="https://linkedin.com/jobs/..."
                value={formData.jobLink}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium"
              />
            </div>
            <button 
              type="button"
              onClick={handleLinkImport}
              disabled={loading || !formData.jobLink}
              className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap active:scale-[0.98] h-[46px]"
            >
              {loading ? 'Importing...' : 'Auto-fill Details'}
            </button>
          </div>
        )}

        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm mb-6 border border-rose-100 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Name *</label>
              <input 
                type="text" 
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800"
                placeholder="Google, Microsoft, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Role / Title *</label>
              <input 
                type="text" 
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition appearance-none bg-white font-bold text-slate-700"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Source</label>
              <select 
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition appearance-none bg-white font-bold text-slate-700"
              >
                <option value="manual">Manual Entry</option>
                <option value="linkedin">LinkedIn</option>
                <option value="naukri">Naukri</option>
                <option value="other">Other Tracker</option>
              </select>
            </div>
          </div>

          {isEditMode && (
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1.5">Job URL</label>
               <input 
                 type="url" 
                 name="jobLink"
                 value={formData.jobLink}
                 onChange={handleChange}
                 className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium"
                 placeholder="https://..."
               />
             </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-[0.98]"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Application' : 'Save Application')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;

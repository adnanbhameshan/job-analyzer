import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Edit2, Trash2, ExternalLink, Download } from 'lucide-react';
import apiClient from '../api/client';
import { format } from 'date-fns';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await apiClient.get('/jobs');
      setJobs(data);
      setFilteredJobs(data);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      console.error('Failed to fetch jobs', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = jobs;
    if (statusFilter !== 'All') {
      result = result.filter(job => job.status === statusFilter);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(job => 
        job.company.toLowerCase().includes(lowerSearch) || 
        job.role.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredJobs(result);
  }, [search, statusFilter, jobs]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await apiClient.delete(`/jobs/${id}`);
        setJobs(jobs.filter(job => job._id !== id));
      } catch (error) {
        console.error('Failed to delete job', error);
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Company,Role,Status,Source,Date Applied,Link\n'];
    const csvContent = filteredJobs.map(j => {
      const date = format(new Date(j.createdAt), 'yyyy-MM-dd');
      return `"${j.company}","${j.role}","${j.status}","${j.source}","${date}","${j.jobLink || ''}"`;
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `job_applications_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-pulse bg-slate-200 h-10 w-10 rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Job Applications</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white text-slate-700 font-semibold px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition active:scale-[0.98]"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => navigate('/jobs/add')} 
            className="bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-indigo-700 transition active:scale-[0.98]"
          >
            + Add Job
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by company or role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition appearance-none bg-white font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Company & Role</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Date Applied</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs">Source</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? filteredJobs.map(job => (
                <tr key={job._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{job.role}</div>
                    <div className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                      {job.company}
                      {job.jobLink && (
                        <a href={job.jobLink} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1 rounded" title="View Job Post">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      job.status === 'Applied' ? 'bg-indigo-100 text-indigo-700' :
                      job.status === 'Interview' ? 'bg-yellow-100 text-yellow-700' :
                      job.status === 'Offer' ? 'bg-green-100 text-green-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 capitalize">
                    {job.source}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/jobs/edit/${job._id}`, { state: { job } })}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(job._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={32} className="mb-3 opacity-50" />
                      <p className="font-medium text-slate-500">No matching jobs found. Get applying!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobList;

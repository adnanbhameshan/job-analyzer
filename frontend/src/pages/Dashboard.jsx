import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, CheckCircle, XCircle, Clock, Building, TrendingUp } from 'lucide-react';
import apiClient from '../api/client';

const COLORS = {
  Applied: '#6366f1',
  Interview: '#eab308', 
  Offer: '#22c55e',
  Rejected: '#ef4444'
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await apiClient.get('/jobs/dashboard');
        setMetrics(data.metrics);
        setRecent(data.recentActivity);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        console.error('Failed to fetch dashboard data', error);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-pulse flex space-x-4"><div className="rounded-full bg-slate-200 h-12 w-12"></div></div></div>;
  }

  if (!metrics) return null;

  const chartData = [
    { name: 'Applied', value: metrics.Applied },
    { name: 'Interview', value: metrics.Interview },
    { name: 'Offer', value: metrics.Offer },
    { name: 'Rejected', value: metrics.Rejected },
  ].filter(item => item.value > 0);

  const total = metrics.total || 1;
  const successRate = ((metrics.Offer / total) * 100).toFixed(1);
  const interviewRate = ((metrics.Interview / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <button onClick={() => navigate('/jobs/add')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition active:scale-[0.98]">
          + Add Job
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Jobs" value={metrics.total} icon={<Briefcase size={22} />} color="text-slate-600" bg="bg-slate-100" />
        <MetricCard title="Applied" value={metrics.Applied} icon={<Clock size={22} />} color="text-indigo-600" bg="bg-indigo-100" />
        <MetricCard title="Interviewing" value={metrics.Interview} icon={<Building size={22} />} color="text-yellow-600" bg="bg-yellow-100" />
        <MetricCard title="Offers" value={metrics.Offer} icon={<CheckCircle size={22} />} color="text-green-600" bg="bg-green-100" />
        <MetricCard title="Rejected" value={metrics.Rejected} icon={<XCircle size={22} />} color="text-rose-600" bg="bg-rose-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Application Pipeline</h2>
          {chartData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {chartData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[entry.name] }}></div>
                    <span className="text-sm text-slate-600 font-semibold">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 h-[280px]">
              <p className="font-medium">No data to visualize yet</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-5 tracking-tight">Conversion Rates</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 font-semibold text-sm">Interview Rate</span>
                  <span className="text-xl font-bold text-yellow-600">{interviewRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner">
                  <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${interviewRate}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 font-semibold text-sm">Success Rate</span>
                  <span className="text-xl font-bold text-green-600">{successRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${successRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Recent Activity</h2>
            <div className="space-y-4">
              {recent.length > 0 ? recent.map(job => (
                <div key={job._id} className="flex justify-between items-start border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <div className="truncate pr-4">
                    <p className="font-bold text-slate-800 truncate">{job.role}</p>
                    <p className="text-sm text-slate-500 font-medium truncate">{job.company}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                    job.status === 'Applied' ? 'bg-indigo-100 text-indigo-700' :
                    job.status === 'Interview' ? 'bg-yellow-100 text-yellow-700' :
                    job.status === 'Offer' ? 'bg-green-100 text-green-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {job.status}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4 font-medium">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3.5 rounded-2xl ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
    </div>
  </div>
);

export default Dashboard;

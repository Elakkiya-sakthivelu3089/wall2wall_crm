import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Bell, 
  List, 
  Users, 
  UserPlus, 
  Calendar, 
  ShoppingCart, 
  LayoutGrid,
  TrendingUp,
  Landmark,
  XCircle
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { leadService } from '../services/api';
import type { DashboardStats } from '../types/crm';
import LeadModal from '../components/modals/LeadModal';
import TaskModal from '../components/modals/TaskModal';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [statsData, tasksData] = await Promise.all([
        leadService.getStats(),
        leadService.getTasks({ page: 1, limit: 5 })
      ]);
      setStats(statsData);
      setTasks(tasksData.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setStats(null);
      setTasks([]);
      setErrorMsg(error?.response?.data?.message || 'Unable to load dashboard data right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { user } = useAuth();

  if (isLoading || !stats) {
    if (!isLoading && errorMsg) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md rounded-xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
            <button
              onClick={fetchData}
              className="mt-4 rounded bg-brand px-4 py-2 text-[11px] font-bold uppercase text-white"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statTiles = [
    { label: 'Fresh Leads', value: stats.freshlead, icon: <LayoutGrid />, path: '/leadhub' },
    { label: 'Yet To Follow-up', value: stats.yettofollow, icon: <Bell />, path: '/leads' },
    { label: 'Follow-ups', value: stats.followup, icon: <Users />, path: '/leads' },
    { label: 'Opportunities', value: stats.opportunities, icon: <TrendingUp />, path: '/leads' },
    { label: 'Order Booked', value: stats.orderbook, icon: <ShoppingCart />, path: '/leads' },
    { label: 'Showroom Visit', value: stats.showRoomVisit, icon: <Landmark />, path: '/visits' },
    { label: 'Appointment Fix', value: stats.appointment, icon: <Calendar />, path: '/appointment' },
    { label: 'Disqualified', value: stats.disqualified, icon: <XCircle />, path: '/leads' },
  ];

  const chartData = [
    { name: 'Total Leads', value: stats.freshlead + stats.yettofollow + stats.followup + stats.opportunities + stats.orderbook + stats.disqualified + stats.creleads + stats.fealeads + stats.designlead },
    { name: 'Followup Leads', value: stats.followup },
    { name: 'Opportunity Leads', value: stats.opportunities },
  ];

  return (
    <div className="container-fluid py-4">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h4 className="page-title text-xl font-bold text-gray-700 m-0">Dashboard</h4>
        </div>
        <div className="flex gap-2">
           {(user?.role === 'ADMIN' || user?.role === 'DM_EXECUTIVE') && (
             <button 
               onClick={() => setIsModalOpen(true)}
               className="btn-custom !rounded-full !px-5 !py-1.5 text-[11px] flex items-center gap-2"
             >
               <Plus size={16} /> Create Lead
             </button>
           )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {statTiles.map((tile, idx) => (
          <Link 
            key={idx} 
            to={tile.path}
            className="tilebox-one group cursor-pointer hover:shadow-md transition-shadow !p-4 md:!p-6 block relative"
          >
            <div className="absolute right-3 top-3 md:right-5 md:top-5 text-gray-200 group-hover:text-brand transition-colors opacity-50 md:opacity-100">
              {React.cloneElement(tile.icon as React.ReactElement<any>, { size: window.innerWidth < 768 ? 24 : 32 })}
            </div>
            <h6 className="text-gray-400 text-[9px] md:text-xs font-bold uppercase mt-0 mb-2 md:mb-3 tracking-wider">{tile.label}</h6>
            <h2 className="text-xl md:text-3xl font-bold text-gray-700 m-0">{tile.value}</h2>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Reminders */}
        <div className="card-box min-h-[250px] md:h-[500px] flex flex-col">
          <h4 className="header-title text-base font-bold text-gray-700 mb-4 flex items-center justify-between">
            Reminders <div className="flex items-center"><Bell size={18} className="text-gray-400" /><span className="bg-danger text-white text-[10px] font-bold px-1.5 rounded-full ml-1">0</span></div>
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic text-sm">
            No reminders scheduled
          </div>
        </div>

        {/* Internal Task */}
        <div className="card-box h-[500px] flex flex-col">
          <h4 className="header-title text-base font-bold text-gray-700 mb-4 flex items-center justify-between">
            Internal Task <div className="flex items-center"><Bell size={18} className="text-gray-400" /><span className="bg-danger text-white text-[10px] font-bold px-1.5 rounded-full ml-1">{tasks.length}</span></div>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-secondary text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 uppercase hover:opacity-90 transition-colors"
            >
              <Plus size={12} /> Create
            </button>
          </h4>
          <div className="flex-1 overflow-y-auto space-y-4">
             {tasks.length > 0 ? (
               tasks.map((task) => (
                <div key={task.id} className="p-3 border-b border-gray-50 last:border-0">
                  <div className={`text-white text-[9px] font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${
                    task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-danger' : 
                    task.priority === 'MEDIUM' ? 'bg-warning' : 'bg-brand'
                  }`}>
                    {task.priority}
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1">
                    {task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'No due date'}
                  </p>
                  <h6 className="text-sm font-bold text-gray-700 mb-1">{task.title}</h6>
                  <div className="flex justify-between text-[10px] text-gray-400 italic">
                    <span>{task.assignedTo?.fullName || 'Unassigned'}</span>
                    <span>{new Date(task.createdAt).toLocaleString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
               ))
             ) : (
               <div className="flex-1 flex items-center justify-center text-gray-400 italic text-sm">
                 No internal tasks
               </div>
             )}
          </div>
        </div>

        {/* Counts Column */}
        <div className="space-y-6">
           {[
             { label: 'Internal Task', value: stats.internal, icon: List },
             { label: 'Assign Leads for CRE', value: stats.creleads, icon: UserPlus },
             { label: 'Assign Leads for Feasibility', value: stats.fealeads, icon: TrendingUp },
             { label: 'Assign Leads for Designer', value: stats.designlead, icon: Landmark },
           ].map((item, i) => (
             <div key={i} className="tilebox-one mb-0 py-4 h-[110px]">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200">
                  <item.icon size={40} />
                </div>
                <h6 className="text-gray-400 text-[10px] font-bold uppercase mt-0 mb-2 tracking-wider">{item.label}</h6>
                <h2 className="text-2xl font-bold text-gray-700 m-0">{item.value}</h2>
             </div>
           ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-box">
          <h4 className="header-title text-base font-bold text-gray-700 mb-6">Lead Activity Chart</h4>
          <div className="h-[350px] relative w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#2089F0" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-box">
          <h4 className="header-title text-base font-bold text-gray-700 mb-6">Task Activity Chart</h4>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
             <div className="h-[250px] w-full sm:w-1/2 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-[15px] border-[#8101c8] border-l-[#8ed244] border-t-[#ee1cca] border-r-[#fbf35a] relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Tasks</span>
                   </div>
                </div>
             </div>
             <div>
                <table className="w-full text-sm border-collapse">
                   <thead>
                      <tr className="bg-gray-50 border border-gray-100">
                         <th className="p-2 text-left text-xs font-bold text-gray-500 uppercase">Task</th>
                         <th className="p-2 text-center text-xs font-bold text-gray-500 uppercase">Count</th>
                      </tr>
                   </thead>
                   <tbody>
                      {['Todo', 'Inprogress', 'Completed', 'Close'].map((task, i) => (
                        <tr key={i} className="border border-gray-100">
                           <td className="p-2 text-gray-600 font-medium">{task}</td>
                           <td className="p-2 text-center font-bold text-gray-700">{[stats.internal, 0, 0, 0][i]}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
              </div>
           </div>
         </div>
       </div>
 
       <LeadModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSuccess={() => {
             fetchData();
             setIsModalOpen(false);
         }}
       />
       <TaskModal 
         isOpen={isTaskModalOpen}
         onClose={() => setIsTaskModalOpen(false)}
         onSuccess={() => {
             fetchData();
             setIsTaskModalOpen(false);
         }}
       />
     </div>
   );
 };
 
 export default Dashboard;

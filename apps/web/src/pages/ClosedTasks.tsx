import React, { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/api';
import { 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import TaskModal from '../components/modals/TaskModal';

const ClosedTasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Filter for COMPLETED status
      const res = await leadService.getTasks({ page, limit: 10, status: 'COMPLETED' });
      setTasks(res.data);
      setTotal(res.total);
      if (res.data.length > 0 && !selectedTask) {
        setSelectedTask(res.data[0]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedTask]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h4 className="page-title text-xl font-bold text-gray-700 m-0">Closed Tasks Archive</h4>
        <div className="flex gap-2">
            {/* Create task disabled in closed view for clarity */}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)]">
          {/* List View */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="p-3 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Completed History</span>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1 text-gray-600 disabled:opacity-30"><ChevronLeft size={16}/></button>
                       <span className="text-[10px] font-bold text-gray-500">Page {page} / {Math.max(1, Math.ceil(total/10))}</span>
                       <button onClick={() => setPage(p => p+1)} disabled={page >= Math.max(1, Math.ceil(total/10))} className="p-1 text-gray-600 disabled:opacity-30"><ChevronRight size={16}/></button>
                    </div>
                </div>
              <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                  {isLoading ? (
                      <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-brand border-t-transparent animate-spin rounded-full" /></div>
                  ) : tasks.length === 0 ? (
                      <div className="p-10 text-center text-[10px] text-gray-400 font-bold uppercase">No completed tasks found</div>
                  ) : tasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedTask?.id === task.id ? 'bg-gray-50 border-l-brand' : 'hover:bg-gray-50 border-l-transparent'}`}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <h6 className="text-[13px] font-bold text-gray-700 m-0 line-clamp-1">{task.title}</h6>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${getPriorityColor(task.priority)}`}>
                                  {task.priority || 'Low'}
                              </span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-brand uppercase">{task.status}</span>
                              <span className="text-[9px] text-gray-300 italic">{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Detail View */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              {selectedTask ? (
                  <div className="flex flex-col h-full">
                      <div className="p-6 border-b border-gray-100">
                          <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                  <h2 className="text-xl font-bold text-gray-700 m-0">{selectedTask.title}</h2>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                     Completed on {new Date(selectedTask.updatedAt).toLocaleString()}
                                  </p>
                              </div>
                              <div className="flex gap-2">
                                  <span className="bg-brand/10 text-brand px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-brand/20 flex items-center gap-2">
                                    <CheckSquare size={12} /> Task Closed
                                  </span>
                              </div>
                          </div>
                      </div>

                      <div className="p-6 space-y-6 overflow-y-auto flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                  <div className="text-sm text-gray-600 bg-gray-50 p-4 border border-gray-100 rounded">
                                      {selectedTask.description || 'No description provided.'}
                                  </div>
                              </div>
                              
                              <div className="space-y-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase">Assigned To</label>
                                      <div className="flex items-center gap-3 bg-white p-3 border border-gray-100 rounded shadow-sm">
                                          <div className="w-8 h-8 rounded bg-brand text-white flex items-center justify-center font-bold text-sm">
                                              {(selectedTask.assignedTo?.fullName || 'S')[0]}
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-gray-700 m-0">{selectedTask.assignedTo?.fullName || 'Unassigned'}</p>
                                              <p className="text-[10px] text-gray-400 uppercase m-0">{selectedTask.assignedTo?.role || 'Staff'}</p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase">Related Lead</label>
                                      {selectedTask.lead ? (
                                          <div className="p-3 bg-white border border-gray-100 rounded shadow-sm">
                                              <p className="text-sm font-bold text-brand m-0">{selectedTask.lead.name}</p>
                                              <p className="text-[10px] text-gray-400 m-0 mt-1">{selectedTask.lead.phone}</p>
                                          </div>
                                      ) : (
                                          <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded italic text-[10px] text-gray-400 uppercase">
                                             General Task
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                      <CheckSquare size={60} className="opacity-10 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Select a task to view details</p>
                  </div>
              )}
          </div>
      </div>
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
            fetchTasks();
            setIsModalOpen(false);
        }}
        task={null}
      />
    </div>
  );
};

export default ClosedTasks;

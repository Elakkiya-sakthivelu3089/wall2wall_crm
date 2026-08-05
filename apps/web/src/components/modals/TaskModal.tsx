import React, { useState, useEffect } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { leadService } from '../../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: any;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    leadId: '',
    assignedToId: '',
    dueDate: ''
  });
  const [masters, setMasters] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const data = await leadService.getMasters();
        setMasters(data);
      } catch (error) {
        console.error('Error fetching masters:', error);
      }
    };
    if (isOpen) fetchMasters();
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        leadId: task.leadId || '',
        assignedToId: task.assignedToId || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
        setFormData({
            title: '',
            description: '',
            status: 'TODO',
            priority: 'MEDIUM',
            leadId: '',
            assignedToId: '',
            dueDate: ''
        });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };

      if (task?.id) {
        await leadService.updateTask(task.id, data);
      } else {
        await leadService.createTask(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#3b3e47] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
                <ClipboardList className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold font-rubik uppercase tracking-tight">{task ? 'Modify Task' : 'Create Internal Task'}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Operational Workflow Unit</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task Title <span className="text-brand">*</span></label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="What needs to be done?"
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Add operational details..."
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</label>
                    <input 
                      type="date"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign Personnel</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                      value={formData.assignedToId}
                      onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                    >
                      <option value="">Unassigned</option>
                      {masters?.users?.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.fullName}</option>
                      ))}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Linked Lead</label>
                    <button 
                      type="button"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-left font-bold text-[#313a46] opacity-50 cursor-not-allowed"
                    >
                      Search Leads...
                    </button>
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-4 rounded-xl border border-gray-200 text-gray-400 font-bold text-[10px] hover:bg-gray-50 transition-all uppercase tracking-[0.2em]"
            >
              Abort
            </button>
            <button 
              disabled={isSubmitting}
              type="submit"
              className="flex-1 px-6 py-4 rounded-xl bg-brand text-white font-bold text-[10px] hover:bg-[#004d30] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <>{task ? 'Update Matrix' : 'Initialize Task'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

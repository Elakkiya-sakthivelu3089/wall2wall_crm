import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
import { leadService } from '../../services/api';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: any;
  mode?: 'appointment' | 'visit';
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSuccess, appointment, mode = 'appointment' }) => {
  const [formData, setFormData] = useState<any>({
    leadId: '',
    showroomId: '',
    appointmentDate: '',
    visitDate: '',
    status: 'Scheduled',
    comments: ''
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

  const toLocalISOString = (dateString?: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (appointment) {
      setFormData({
        leadId: appointment.leadId || '',
        showroomId: appointment.showroomId || '',
        appointmentDate: toLocalISOString(appointment.appointmentDate),
        visitDate: toLocalISOString(appointment.visitDate),
        status: appointment.status || 'Scheduled',
        comments: appointment.comments || ''
      });
    } else {
        setFormData({
            leadId: '',
            showroomId: '',
            appointmentDate: '',
            visitDate: '',
            status: 'Scheduled',
            comments: ''
        });
    }
  }, [appointment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'visit') {
        const data = {
          leadId: formData.leadId,
          showroomId: formData.showroomId,
          visitDate: new Date(formData.visitDate || formData.appointmentDate),
          comments: formData.comments
        };
        if (appointment?.id) {
          await leadService.updateVisit(appointment.id, data);
        } else {
          await leadService.createVisit(data);
        }
      } else {
        const data = {
          ...formData,
          appointmentDate: new Date(formData.appointmentDate)
        };
        if (appointment?.id) {
          await leadService.updateAppointment(appointment.id, data);
        } else {
          await leadService.createAppointment(data);
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving engagement:', error);
      alert('Failed to save record.');
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
                <Calendar className="w-6 h-6" />
             </div>
              <div>
                <h3 className="text-xl font-bold font-rubik uppercase tracking-tight">{appointment ? 'Modify' : 'Fix'} {mode === 'visit' ? 'Showroom Visit' : 'Engagement'}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{mode === 'visit' ? 'In-Store Protocol' : 'Showroom Visit Matrix'}</p>
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Prospect <span className="text-brand">*</span></label>
                <select 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                  value={formData.leadId}
                  onChange={(e) => setFormData({...formData, leadId: e.target.value})}
                >
                  <option value="">Select Target Lead</option>
                  {/* In a real app, this might be a searchable select */}
                  {masters?.recentLeads?.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showroom Location <span className="text-brand">*</span></label>
                <select 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                  value={formData.showroomId}
                  onChange={(e) => setFormData({...formData, showroomId: e.target.value})}
                >
                  <option value="">Select Experience Center</option>
                  {masters?.showrooms?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mode === 'visit' ? 'Visit Time' : 'Engagement Time'} <span className="text-brand">*</span></label>
                    <input 
                      required
                      type="datetime-local"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                      value={mode === 'visit' ? formData.visitDate : formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, [mode === 'visit' ? 'visitDate' : 'appointmentDate']: e.target.value})}
                    />
                </div>
                {mode === 'appointment' && (
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46]"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rescheduled">Rescheduled</option>
                      </select>
                  </div>
                )}
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Remarks</label>
                <textarea 
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-[#313a46] resize-none"
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  placeholder="Additional visit protocols..."
                />
             </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-4 rounded-xl border border-gray-200 text-gray-400 font-bold text-[10px] hover:bg-gray-50 transition-all uppercase tracking-[0.2em]"
            >
              Cancel
            </button>
            <button 
              disabled={isSubmitting}
              type="submit"
              className="flex-1 px-6 py-4 rounded-xl bg-brand text-white font-bold text-[10px] hover:bg-[#004d30] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <>Manifest Schedule <CheckCircle2 size={14} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;

import React, { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/api';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import AppointmentModal from '../components/modals/AppointmentModal';

const Visits: React.FC = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await leadService.getVisits({ page, limit: 10 });
            setAppointments(res.data);
            setTotal(res.total);
            if (res.data.length > 0 && !selectedAppointment) {
                setSelectedAppointment(res.data[0]);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, selectedAppointment]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return (
        <div className="container-fluid py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h4 className="page-title text-xl font-bold text-gray-700 m-0">Showroom Visit</h4>
                <div className="flex gap-2">
                     <button 
                        onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}
                        className="btn-custom !rounded-full !px-5 !py-1.5 text-[11px] flex items-center gap-2"
                     >
                        <Plus size={16} /> Fix Appointment
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)]">
                {/* List View */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-3 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Visit Timeline</span>
                        <div className="flex items-center gap-2">
                           <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1 text-gray-600 disabled:opacity-30"><ChevronLeft size={16}/></button>
                           <span className="text-[10px] font-bold text-gray-500">Page {page} / {Math.max(1, Math.ceil(total/10))}</span>
                           <button onClick={() => setPage(p => p+1)} disabled={page >= Math.max(1, Math.ceil(total/10))} className="p-1 text-gray-600 disabled:opacity-30"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 overflow-y-auto flex-1 bg-white">
                        {isLoading ? (
                            <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-brand border-t-transparent animate-spin rounded-full" /></div>
                        ) : appointments.map(app => (
                            <div 
                              key={app.id}
                              onClick={() => setSelectedAppointment(app)}
                              className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedAppointment?.id === app.id ? 'bg-gray-50 border-l-brand' : 'hover:bg-gray-50 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h6 className="text-[13px] font-bold text-gray-700 m-0 line-clamp-1">
                                      {app.lead?.name || 'Prospect'}
                                    </h6>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${app.status === 'Confirmed' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                                        {app.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                                    <MapPin size={10} className="text-brand" />
                                    <span>{app.showroom?.name || 'Showroom'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-brand uppercase">{new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-[9px] text-gray-300 italic">{new Date(app.appointmentDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                    {selectedAppointment ? (
                        <div className="flex flex-col h-full bg-white">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-gray-700 m-0">{selectedAppointment.lead?.name}</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={12} /> Appointment Time: {new Date(selectedAppointment.appointmentDate).toLocaleString()}
                                        </p>
                                    </div>
                                     <div className="flex gap-2">
                                        <button 
                                          onClick={() => { setEditingAppointment(selectedAppointment); setIsModalOpen(true); }}
                                          className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-gray-200"
                                        >
                                          Reschedule
                                        </button>
                                        <button className="bg-brand text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-2">
                                          Mark Arrived <CheckCircle2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Showroom</label>
                                            <div className="flex items-center gap-3 bg-white p-3 border border-gray-100 rounded shadow-sm">
                                                <div className="p-2 bg-brand/10 rounded">
                                                    <MapPin size={18} className="text-brand" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700 m-0">{selectedAppointment.showroom?.name || 'Experience Center'}</p>
                                                    <p className="text-[10px] text-gray-400 m-0">{selectedAppointment.showroom?.location || 'Main Center'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Remarks</label>
                                            <div className="text-sm text-gray-600 bg-gray-50 p-4 border border-gray-100 rounded italic">
                                                {selectedAppointment.comments || 'No special remarks provided.'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Prospect Info</label>
                                            <div className="flex flex-col gap-2 p-4 bg-white rounded border border-gray-100 shadow-sm">
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                   <span className="text-[10px] text-gray-400 uppercase">Phone</span>
                                                   <span className="text-sm font-bold text-gray-700">{selectedAppointment.lead?.phone}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                   <span className="text-[10px] text-gray-400 uppercase">Email</span>
                                                   <span className="text-sm font-bold text-brand">{selectedAppointment.lead?.email || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                   <span className="text-[10px] text-gray-400 uppercase">Status</span>
                                                   <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Scheduled</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <Calendar size={60} className="opacity-10 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Select an appointment to view details</p>
                        </div>
                    )}
                </div>
            </div>
            <AppointmentModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                  fetchAppointments();
                  setIsModalOpen(false);
              }}
              appointment={editingAppointment}
              mode="visit"
            />
        </div>
    );
};

export default Visits;

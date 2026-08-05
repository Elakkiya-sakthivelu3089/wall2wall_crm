import { useState, type ElementType, type FC } from 'react';
import { 
  Mail, 
  Calendar, 
  Star, 
  MessageSquare,
  User,
  Activity,
  Edit2,
  Bell,
  CheckCircle,
  FileText,
  UserPlus,
  Send,
  Video,
  Share2,
  Lock,
  Smartphone,
  LayoutGrid,
  Trash2
} from 'lucide-react';
import type { Lead } from '../../types/crm';
import ActionModal from '../modals/ActionModal';
import LeadModal from '../modals/LeadModal';
import { useAuth } from '../../contexts/AuthContext';
import ActivityTimeline from './ActivityTimeline';
import { leadService } from '../../services/api';

interface LeadDetailViewProps {
  lead: Lead | null;
  onRefresh?: () => void;
}

interface ActionButtonProps {
  icon: ElementType;
  label: string;
  color?: string;
  onClick: () => void;
}

const ActionButton = ({ icon: Icon, label, color = 'bg-brand', onClick }: ActionButtonProps) => (
  <button 
    onClick={onClick}
    className={`${color} text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all`}
  >
     <Icon size={12} /> {label}
  </button>
);

const LeadDetailView: FC<LeadDetailViewProps> = ({ lead, onRefresh }) => {
  const { user: currentUser } = useAuth();
  const isDmEmployee = currentUser?.role === 'DM_EXECUTIVE';
  const [modalType, setModalType] = useState<'FOLLOWUP' | 'REMINDER' | 'STATUS' | 'NOTE' | 'APPOINTMENT' | 'SWITCH_USER' | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm('Are you sure you want to delete this lead and all its related data? This action cannot be undone.')) {
        try {
            await leadService.deleteLead(lead.id);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to delete lead", error);
            alert('Failed to delete lead. See console for details.');
        }
    }
  };

  if (!lead) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white border border-gray-100 rounded shadow-sm">
        <User size={48} className="opacity-20 mb-4" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Select a lead to view details</h4>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border border-gray-100 shadow-sm overflow-y-auto">
      {/* Header Info */}
      <div className="p-4 md:p-5 border-b border-gray-100">
        <div className="flex justify-between items-start mb-5">
           <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-700 m-0">{lead.name}</h2>
              <div className="text-[12px] font-bold text-gray-600">
                 <span>{lead.phone}</span>
                 <span className="text-gray-400 font-medium ml-3">{lead.email}</span>
              </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
              <div className="flex text-warning gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <Star key={i} size={10} fill={i < (lead.rating || 0) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Rating ({lead.rating}/10)</span>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4">
           <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Lead Type</label>
              <p className="text-[11px] font-bold text-gray-700">{lead.leadType || 'Direct Lead'}</p>
           </div>
           <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Created By</label>
              <p className="text-[11px] font-bold text-gray-700">{lead.createdBy?.fullName || '-'}</p>
           </div>
           <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Assigned To</label>
              <p className="text-[11px] font-bold text-gray-700">{lead.assignedTo?.fullName || '-'}</p>
           </div>
           <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Status</label>
              <p className="text-[11px] font-bold text-brand uppercase">{typeof lead.status === 'object' ? lead.status?.name : lead.status}</p>
           </div>
           <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Date Collected</label>
              <p className="text-[11px] font-bold text-gray-700">{lead.dataCollected ? new Date(lead.dataCollected).toLocaleDateString() : '-'}</p>
           </div>
           <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Contactable Date & Time</label>
              <p className="text-[11px] font-bold text-gray-700">
                {lead.contactableDate ? new Date(lead.contactableDate).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true 
                }) : '-'}
              </p>
           </div>
            <div className="space-y-0.5 col-span-2 md:col-span-3 mt-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Instructions</label>
              <p className="text-[11px] font-bold text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 italic">{lead.instructionToPass || 'No instructions provided'}</p>
            </div>
            {lead.brand?.logo && (
              <div className="col-span-2 md:col-span-3 mt-2 pt-2 border-t border-gray-50">
                 <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Associated Brand</label>
                 <img src={lead.brand.logo} alt={lead.brand.name} className="h-12 object-contain" />
              </div>
            )}
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-6">
        {/* Actions Grid */}
        {isDmEmployee ? (
          <div className="rounded border border-sky-100 bg-sky-50 px-4 py-3 text-[11px] font-bold text-sky-700 uppercase tracking-wide">
            DM Executive access: view lead details and progress only.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
             <ActionButton icon={Edit2} label="Edit" color="bg-brand" onClick={() => setIsEditModalOpen(true)} />
             <ActionButton icon={Activity} label="Followup" color="bg-secondary" onClick={() => setModalType('FOLLOWUP')} />
             <ActionButton icon={Bell} label="Reminder" color="bg-brand" onClick={() => setModalType('REMINDER')} />
             <ActionButton icon={Calendar} label="Appointment" color="bg-brand" onClick={() => setModalType('APPOINTMENT')} />
             <ActionButton icon={FileText} label="Requirement" color="bg-brand" onClick={() => setModalType('NOTE')} />
             <ActionButton icon={Lock} label="Online Req." color="bg-brand" onClick={() => setModalType('NOTE')} />
             <ActionButton icon={Smartphone} label="Contact" color="bg-brand" onClick={() => setModalType('NOTE')} />
             <ActionButton icon={Mail} label="Email" color="bg-brand" onClick={() => setModalType('NOTE')} />
             <ActionButton icon={MessageSquare} label="SMS" color="bg-brand" onClick={() => setModalType('NOTE')} />
             <ActionButton icon={LayoutGrid} label="Showroom" color="bg-brand" onClick={() => setModalType('APPOINTMENT')} />
             {currentUser?.role === 'ADMIN' && <ActionButton icon={UserPlus} label="Switch" color="bg-brand" onClick={() => setModalType('SWITCH_USER')} />}
             <ActionButton icon={CheckCircle} label="KYC Form" color="bg-brand" onClick={() => setModalType('STATUS')} />
             {(currentUser?.role === 'ADMIN' || currentUser?.role === 'BUSINESS_HEAD') && (
                <ActionButton icon={Trash2} label="Delete" color="bg-danger" onClick={handleDelete} />
              )}
          </div>
        )}

        {!isDmEmployee && (
          <>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
               <button className="bg-secondary text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-all">
                  <Send size={12} /> Send Projects
               </button>
               <button className="bg-secondary text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-all">
                  <Share2 size={12} /> Custom Msg
               </button>
               <button className="bg-secondary text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-all">
                  <Video size={12} /> Send Videos
               </button>
            </div>

            <p className="text-[9px] text-gray-400 text-center italic mt-2 uppercase">
               WhatsApp redirection notice: Wait few seconds before clicking send.
            </p>
          </>
        )}

        <div className="pt-4 border-t border-gray-50">
           <ActivityTimeline activities={lead.activities || []} />
        </div>
      </div>

      {modalType && (
        <ActionModal 
          isOpen={true}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            setModalType(null);
          }}
          lead={lead}
          type={modalType}
        />
      )}

      {!isDmEmployee && (
        <LeadModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
              if (onRefresh) onRefresh();
              setIsEditModalOpen(false);
          }}
          lead={lead}
        />
      )}
    </div>
  );
};

export default LeadDetailView;

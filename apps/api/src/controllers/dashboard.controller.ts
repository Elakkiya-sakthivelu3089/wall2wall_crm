import prisma from '../lib/prisma.js';
import type { Request, Response } from 'express';
import { asyncHandler, apiResponse } from '../utils/apiUtils.js';


export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    freshLeads,
    yetToFollowUp,
    followups,
    opportunities,
    orderBooked,
    showroomVisits,
    appointments,
    disqualified,
    internalTasks,
    creLeads,
    designCompleted,
    fealeads,
    designlead,
  ] = await Promise.all([
    // Count leads by status/type
    prisma.lead.count({
      where: {
        OR: [
          { status: { name: 'Fresh' } },
          { statusId: null }
        ]
      }
    }),
    prisma.lead.count({ where: { status: { name: 'Yet To Follow-up' } } }),
    prisma.lead.count({ where: { status: { name: 'Follow-up' } } }),
    prisma.lead.count({ where: { status: { name: 'Opportunities' } } }),
    prisma.lead.count({ where: { status: { name: 'Order Booked' } } }),
    
    // Other modules
    prisma.showroomVisit.count(),
    prisma.appointment.count(),
    
    // Disqualified
    prisma.lead.count({ where: { status: { name: 'Disqualified' } } }),
    
    // Tasks
    prisma.task.count({ where: { status: 'TODO' } }),
    
    // CRE Leads (Assigned but not fresh)
    prisma.lead.count({ where: { NOT: { assignedToId: null } } }),

    // Design Completed
    prisma.lead.count({ where: { status: { name: 'Design Completed' } } }),

    // Feasibility Desk
    prisma.lead.count({ where: { status: { name: { contains: 'Feasibility', mode: 'insensitive' } } } }),

    // Design Allocation
    prisma.lead.count({ where: { status: { name: { contains: 'Design', mode: 'insensitive' } } } }),
  ]);

  apiResponse.success(res, {
    freshlead: freshLeads,
    yettofollow: yetToFollowUp,
    followup: followups,
    opportunities: opportunities,
    orderbook: orderBooked,
    showRoomVisit: showroomVisits,
    appointment: appointments,
    disqualified: disqualified,
    internal: internalTasks,
    creleads: creLeads,
    designCompleted: designCompleted,
    fealeads: fealeads || 0,
    designlead: designlead || 0,
  });
});

import prisma from '../lib/prisma.js';
import type { Request, Response } from 'express';
import { asyncHandler, apiResponse } from '../utils/apiUtils.js';
import { applyLeadVisibility, getRequestUser } from '../utils/leadAccess.js';


export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getRequestUser(req);
  const leadScope: any = {};
  await applyLeadVisibility(leadScope, currentUser);
  const scopedLeadWhere = (extra: any = {}) => ({
    ...extra,
    ...leadScope,
    AND: [
      ...(extra.AND || []),
      ...(leadScope.AND || []),
    ],
  });

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
      where: scopedLeadWhere({
        OR: [
          { status: { name: 'Fresh' } },
          { statusId: null }
        ]
      })
    }),
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: 'Yet To Follow-up' } }) }),
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: 'Follow-up' } }) }),
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: 'Opportunities' } }) }),
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: 'Order Booked' } }) }),
    
    // Other modules
    prisma.showroomVisit.count({ where: { lead: leadScope } }),
    prisma.appointment.count({ where: { lead: leadScope } }),
    
    // Disqualified
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: 'Disqualified' } }) }),
    
    // Tasks
    prisma.task.count({ where: { status: 'TODO', lead: leadScope } }),
    
    // CRE Leads (Assigned but not fresh)
    prisma.lead.count({ where: scopedLeadWhere({ NOT: { assignedToId: null } }) }),

    // Design Completed
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: 'Design Completed' } }) }),

    // Feasibility Desk
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: { contains: 'Feasibility', mode: 'insensitive' } } }) }),

    // Design Allocation
    prisma.lead.count({ where: scopedLeadWhere({ status: { name: { contains: 'Design', mode: 'insensitive' } } }) }),
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

import prisma from '../lib/prisma.js';
import { asyncHandler, apiResponse } from '../utils/apiUtils.js';


export const getVisits = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, leadId } = req.body;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (leadId) where.leadId = String(leadId);

    const [visits, total] = await Promise.all([
      prisma.showroomVisit.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { visitDate: 'desc' },
        include: {
          lead: { select: { id: true, name: true, phone: true } },
          showroom: true
        }
      }),
      prisma.showroomVisit.count({ where }),
    ]);

    apiResponse.success(res, { data: visits, total, page: Number(page), limit: Number(limit) });
});

export const createVisit = asyncHandler(async (req, res) => {
    const { leadId, visitDate, showroomId, comments } = req.body;
    
    if (!leadId || !visitDate || !showroomId) {
      return apiResponse.error(res, 'Lead ID, Visit Date, and Showroom ID are required', 400);
    }

    const visit = await prisma.showroomVisit.create({
      data: {
        leadId: String(leadId),
        visitDate: new Date(visitDate),
        showroomId: String(showroomId),
        comments: comments || null
      },
      include: {
        lead: true,
        showroom: true
      }
    });

    // Log Activity
    await prisma.leadActivity.create({
      data: {
        leadId: String(leadId),
        type: 'SYSTEM',
        content: `Showroom visit scheduled/recorded at ${visit.showroom.name}`,
      }
    });

    apiResponse.success(res, visit, 'Showroom visit created successfully', 201);
});

export const updateVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
    const { visitDate, ...rest } = req.body;
    const data = { ...rest };
    if (visitDate) data.visitDate = new Date(visitDate);

    const updated = await prisma.showroomVisit.update({
      where: { id: String(id) },
      data,
      include: { lead: true, showroom: true }
    });
    apiResponse.success(res, updated, 'Showroom visit updated successfully');
});

export const deleteVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
    await prisma.showroomVisit.delete({ where: { id: String(id) } });
    apiResponse.success(res, null, 'Showroom visit deleted successfully', 204);
});

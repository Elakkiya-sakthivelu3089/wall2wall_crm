import prisma from '../lib/prisma.js';
import { asyncHandler, apiResponse } from '../utils/apiUtils.js';


export const taskController = {
  getTasks: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status } = req.body;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            assignedTo: { select: { id: true, fullName: true, role: true } },
            lead: { select: { id: true, name: true, phone: true } }
        }
      }),
      prisma.task.count({ where }),
    ]);

    apiResponse.success(res, { data: tasks, total });
  }),

  createTask: asyncHandler(async (req, res) => {
    const task = await prisma.task.create({
      data: req.body,
    });
    apiResponse.success(res, task, 'Task created successfully', 201);
  }),

  updateTask: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await prisma.task.update({
      where: { id: String(id) },
      data: req.body,
    });
    apiResponse.success(res, updated, 'Task updated successfully');
  }),

  deleteTask: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: String(id) } });
    apiResponse.success(res, null, 'Task deleted successfully', 204);
  })
};

export const appointmentController = {
  getAppointments: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.body;
    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        skip,
        take: Number(limit),
        orderBy: { appointmentDate: 'desc' },
        include: {
            lead: { select: { id: true, name: true, phone: true } },
        }
      }),
      prisma.appointment.count(),
    ]);

    apiResponse.success(res, { data: appointments, total });
  }),

  createAppointment: asyncHandler(async (req, res) => {
    const { leadId, appointmentDate, ...rest } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        leadId: String(leadId),
        appointmentDate: new Date(appointmentDate),
        ...rest
      },
    });
    apiResponse.success(res, appointment, 'Appointment created successfully', 201);
  }),

  updateAppointment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { appointmentDate, ...rest } = req.body;
    const data = { ...rest };
    if (appointmentDate) data.appointmentDate = new Date(appointmentDate);

    const updated = await prisma.appointment.update({
      where: { id: String(id) },
      data,
    });
    apiResponse.success(res, updated, 'Appointment updated successfully');
  }),

  deleteAppointment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: String(id) } });
    apiResponse.success(res, null, 'Appointment deleted successfully', 204);
  })
};

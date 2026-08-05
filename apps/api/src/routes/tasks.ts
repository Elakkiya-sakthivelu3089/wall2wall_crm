import { Router } from 'express';
import { taskController, appointmentController } from '../controllers/tasks.controller.js';

const router = Router();

// Tasks
router.post('/list', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Appointments
router.post('/appointments/list', appointmentController.getAppointments);
router.post('/appointments', appointmentController.createAppointment);
router.put('/appointments/:id', appointmentController.updateAppointment);
router.delete('/appointments/:id', appointmentController.deleteAppointment);

export default router;

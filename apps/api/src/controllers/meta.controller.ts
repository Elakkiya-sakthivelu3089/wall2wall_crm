import type { Request, Response } from 'express';
import { sendMetaLead } from '../services/meta.service.js';

export const sendLeadEvent = async (req: Request, res: Response) => {
  try {
    const { eventId, source, email, phone, pageUrl } = req.body;

    if (!eventId || !source || !pageUrl) {
      return res.status(400).json({
        success: false,
        message: 'eventId, source, and pageUrl are required'
      });
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0] || req.socket.remoteAddress;

    const result = await sendMetaLead({
      eventId,
      source,
      email,
      phone,
      pageUrl,
      ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Lead event error:', error instanceof Error ? error.message : error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send lead event'
    });
  }
};

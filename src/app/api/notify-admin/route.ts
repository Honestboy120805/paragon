import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { type, booking, contact } = await req.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: 'Gmail SMTP credentials not configured.' }, { status: 500 });
    }

    const brandColor = '#0ea5e9';

    const emailHeader = `
      <div style="background-color: ${brandColor}; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-family: serif;">Paragon</h1>
      </div>
    `;

    const emailFooter = `
      <div style="background-color: #f3f4f6; padding: 30px 20px; text-align: center; margin-top: 40px;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">© 2026 Paragon. All rights reserved. Zenna.</p>
      </div>
    `;

    let subject = '';
    let html = '';
    let toEmail = ADMIN_EMAIL;

    if (type === 'admin_new_booking' && booking) {
      toEmail = ADMIN_EMAIL;
      subject = `📅 New Booking Request: ${booking.service_type} - ${booking.name}`;
      html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">📅 New Booking Request</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">A new booking has been submitted. Here are the details:</p>
              <div style="background-color: #f9fafb; border-left: 4px solid ${brandColor}; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Client:</strong> ${booking.name}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Email:</strong> ${booking.email}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Service:</strong> ${booking.service_type}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Event Date:</strong> ${booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Time:</strong> ${booking.event_location || 'N/A'}</p>
                ${booking.message ? `<p style="margin: 0; color: #1f2937;"><strong>Message:</strong> ${booking.message}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://paragondelaftadian.com/admin/bookings" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold;">Manage Bookings</a>
              </div>
            </div>
            ${emailFooter}
          </div>
        </body></html>
      `;
    } else if (type === 'admin_new_contact' && contact) {
      toEmail = ADMIN_EMAIL;
      subject = `📬 New Contact Message: ${contact.subject}`;
      html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">📬 New Contact Message Received</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">Someone has sent you a message through the contact form:</p>
              <div style="background-color: #f9fafb; border-left: 4px solid ${brandColor}; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>From:</strong> ${contact.name}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Email:</strong> ${contact.email}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Subject:</strong> ${contact.subject}</p>
                <p style="margin: 0; color: #1f2937;"><strong>Message:</strong></p>
                <p style="margin: 10px 0 0 0; color: #4b5563;">${contact.message}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://paragondelaftadian.com/admin/contacts" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold;">View in Dashboard</a>
              </div>
            </div>
            ${emailFooter}
          </div>
        </body></html>
      `;
    } else if (type === 'confirmation' && booking) {
      toEmail = booking.email;
      subject = `✅ Booking Confirmed — ${booking.service_type}`;
      html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">✅ Booking Confirmed!</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">Hi ${booking.name},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">Great news! Your booking has been confirmed. Here are the details:</p>
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Service:</strong> ${booking.service_type}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Date:</strong> ${booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong></strong> ${booking.event_location || 'N/A'}</p>
                <p style="margin: 0; color: #1f2937;"><strong>Status:</strong> <span style="color: #10b981;">Confirmed</span></p>
              </div>
              <p style="color: #4b5563; line-height: 1.6;">I'm looking forward to working with you! If you have any questions, feel free to reach out.</p>
            </div>
            ${emailFooter}
          </div>
        </body></html>
      `;
    } else if (type === 'cancellation' && booking) {
      toEmail = booking.email;
      subject = `Booking Cancellation — ${booking.service_type}`;
      html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Booking Cancelled</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">Hi ${booking.name},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">Your booking has been cancelled:</p>
              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Service:</strong> ${booking.service_type}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Original Date:</strong> ${booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 0; color: #1f2937;"><strong>Status:</strong> <span style="color: #ef4444;">Cancelled</span></p>
              </div>
              <p style="color: #4b5563; line-height: 1.6;">We're sorry we couldn't work together this time. Feel free to book again in the future!</p>
            </div>
            ${emailFooter}
          </div>
        </body></html>
      `;
    } else if (type === 'status_update' && booking) {
      toEmail = booking.email;
      subject = `Booking Status Update — ${booking.status}`;
      html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Booking Status Update</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">Hi ${booking.name},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">Your booking status has been updated:</p>
              <div style="background-color: #f9fafb; border-left: 4px solid ${brandColor}; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Service:</strong> ${booking.service_type}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Date:</strong> ${booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 0; color: #1f2937;"><strong>New Status:</strong> <span style="text-transform: capitalize;">${booking.status}</span></p>
              </div>
            </div>
            ${emailFooter}
          </div>
        </body></html>
      `;
    } else if (type === 'reminder' && booking) {
      toEmail = booking.email;
      subject = `📅 Event Reminder — ${booking.service_type}`;
      html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${emailHeader}
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">📅 Event Reminder</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">Hi ${booking.name},</p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">This is a friendly reminder about your upcoming event:</p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Service:</strong> ${booking.service_type}</p>
                <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Date:</strong> ${booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</p>
                <p style="margin: 0; color: #1f2937;"><strong></strong> ${booking.event_location || 'N/A'}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.6;">I'm excited to work with you! Please let me know if you need any last-minute adjustments.</p>
            </div>
            ${emailFooter}
          </div>
        </body></html>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid notification type or missing data' }, { status: 400 });
    }

    const info = await transporter.sendMail({
      from: `"Paragon" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
      replyTo: booking?.email || contact?.email || ADMIN_EMAIL,
    });

    console.log('Email sent successfully, messageId:', info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email send error:', error?.message || JSON.stringify(error));
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

serve(async (req) => {
  // Allow CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    const SUPABASE_URL = Deno?.env?.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY");
    const SMTP_HOST = Deno?.env?.get("SMTP_HOST");
    const SMTP_PORT = parseInt(Deno?.env?.get("SMTP_PORT") || "587");
    const SMTP_USER = Deno?.env?.get("SMTP_USER");
    const SMTP_PASS = Deno?.env?.get("SMTP_PASS");
    const SMTP_SECURE = Deno?.env?.get("SMTP_SECURE") === "true";
    const ADMIN_EMAIL = Deno?.env?.get("ADMIN_EMAIL") || "paragondelaftadian@zohomail.com";
    const SMTP_FROM = Deno?.env?.get("SMTP_FROM") || `Paragon De Laftadian <${ADMIN_EMAIL}>`;
    const APP_URL = Deno?.env?.get("APP_URL") || "https://paragondel6143.builtwithrocket.new";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("SMTP credentials not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const brandColor = "#0ea5e9";
    const rescheduleUrl = `${APP_URL}/my-bookings`;

    const emailHeader = `
      <div style="background-color: ${brandColor}; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-family: serif;">Paragon De Laftadian</h1>
      </div>
    `;

    const emailFooter = `
      <div style="background-color: #f3f4f6; padding: 30px 20px; text-align: center; margin-top: 40px;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">© 2026 Paragon. All rights reserved.</p>
        <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
          <a href="${APP_URL}" style="color: ${brandColor}; text-decoration: none;">Visit Website</a> | 
          <a href="${APP_URL}/contact" style="color: ${brandColor}; text-decoration: none;">Contact Us</a>
        </p>
      </div>
    `;

    // Check for bookings that need reminders (1-5 days before event)
    // We check each day offset: 5, 4, 3, 2, 1 days from now
    const reminderDays = [5, 4, 3, 2, 1];
    const results: { day: number; sent: number; skipped: number; errors: string[] }[] = [];

    for (const daysAhead of reminderDays) {
      // Calculate the target event date (today + daysAhead)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const targetDateStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD

      // Fetch confirmed bookings with event on targetDate
      const { data: bookings, error: fetchError } = await supabase
        .from("bookings")
        .select("id, name, email, service_type, event_date, event_location")
        .eq("status", "confirmed")
        .eq("event_date", targetDateStr);

      if (fetchError) {
        results.push({ day: daysAhead, sent: 0, skipped: 0, errors: [fetchError.message] });
        continue;
      }

      if (!bookings || bookings.length === 0) {
        results.push({ day: daysAhead, sent: 0, skipped: 0, errors: [] });
        continue;
      }

      let sent = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const booking of bookings) {
        // Check if reminder already sent for this booking + day combo
        const { data: existingReminder } = await supabase
          .from("booking_reminders")
          .select("id")
          .eq("booking_id", booking.id)
          .eq("days_before", daysAhead)
          .maybeSingle();

        if (existingReminder) {
          skipped++;
          continue;
        }

        // Build reminder email HTML
        const eventDateFormatted = new Date(booking.event_date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const daysLabel = daysAhead === 1 ? "tomorrow" : `in ${daysAhead} days`;
        const urgencyColor = daysAhead <= 2 ? "#ef4444" : daysAhead <= 3 ? "#f59e0b" : "#10b981";

        const subject = `⏰ Reminder: Your ${booking.service_type} event is ${daysLabel}!`;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
              <div style="max-width: 600px; margin: 0 auto;">
                ${emailHeader}
                <div style="padding: 40px 20px;">
                  <div style="background-color: ${urgencyColor}; color: white; text-align: center; padding: 12px 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold;">📅 Your event is ${daysLabel}!</p>
                  </div>
                  <h2 style="color: #1f2937; margin: 0 0 20px 0;">Event Reminder</h2>
                  <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi ${booking.name},
                  </p>
                  <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
                    This is a friendly reminder that your upcoming event is just <strong>${daysLabel}</strong>. Here are your booking details:
                  </p>
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 24px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Service</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${booking.service_type}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${eventDateFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${booking.event_location}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status</td>
                        <td style="padding: 8px 0;"><span style="color: #10b981; font-weight: bold;">✓ Confirmed</span></td>
                      </tr>
                    </table>
                  </div>
                  <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                    Need to make changes? You can view your booking details or request a reschedule from your bookings page.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${rescheduleUrl}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">View My Bookings &amp; Reschedule</a>
                  </div>
                  <p style="color: #9ca3af; line-height: 1.6; margin: 20px 0 0 0; font-size: 13px; text-align: center;">
                    If you have any urgent questions, please contact us directly.
                  </p>
                </div>
                ${emailFooter}
              </div>
            </body>
          </html>
        `;

        try {
          const client = new SmtpClient();

          if (SMTP_SECURE) {
            await client.connectTLS({ hostname: SMTP_HOST, port: SMTP_PORT, username: SMTP_USER, password: SMTP_PASS });
          } else {
            await client.connect({ hostname: SMTP_HOST, port: SMTP_PORT, username: SMTP_USER, password: SMTP_PASS });
          }

          await client.send({
            from: SMTP_FROM,
            to: booking.email,
            subject,
            content: html,
            html,
          });

          await client.close();

          await supabase
            .from("booking_reminders")
            .insert({
              booking_id: booking.id,
              days_before: daysAhead,
              email_sent_to: booking.email,
              sent_at: new Date().toISOString()
            });

          sent++;
        } catch (emailErr: any) {
          errors.push(`Failed to send to ${booking.email}: ${emailErr?.message || "Unknown error"}`);
        }
      }

      results.push({ day: daysAhead, sent, skipped, errors });
    }

    const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

    return new Response(JSON.stringify({
      success: true,
      message: `Reminder job completed. Sent: ${totalSent}, Skipped (already sent): ${totalSkipped}`,
      results
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
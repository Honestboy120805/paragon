// Branded email

const BRAND_COLOR = '#0ea5e9';
const BRAND_DARK = '#0c4a6e';
const BRAND_ACCENT = '#f59e0b';
const SITE_URL = 'https://paragondelaftadian.com';

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Paragon</title>
  <!--[if mso]><noscript><xml>&lt;o:OfficeDocumentSettings&gt;&lt;o:PixelsPerInch&gt;96&lt;/o:PixelsPerInch&gt;&lt;/o:OfficeDocumentSettings&gt;</xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_COLOR} 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1px;font-family:Georgia,serif;">Paragon</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;">Entertainment &amp; Creative Services</p>
            </td>
          </tr>

          <!-- Body -->
          ${content}

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:36px 48px;text-align:center;">
              <p style="margin:0 0 12px;font-size:14px;color:#94a3b8;">
                <a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Visit Our Website</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${SITE_URL}/booking" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Book a Service</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${SITE_URL}/contact" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Contact Us</a>
              </p>
              <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} Paragon. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(icon: string, label: string, value: string): string {
  return `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="32" valign="top" style="padding-right:12px;">
            <span style="font-size:18px;">${icon}</span>
          </td>
          <td valign="top">
            <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">${label}</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1e293b;">${value}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─────────────────────────────────────────────
// CLIENT CONFIRMATION EMAIL
// ─────────────────────────────────────────────
export interface ClientConfirmationData {
  confirmationNumber: string;
  name: string;
  email: string;
  serviceLabel: string;
  date: string;
  timeSlot: string;
  price: string;
  phone?: string;
  message?: string;
}

export function clientConfirmationEmail(data: ClientConfirmationData): { subject: string; html: string } {
  const subject = `✅ Booking Request Received — ${data.confirmationNumber}`;

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'To be confirmed';

  const html = baseLayout(`
    <!-- Hero Section -->
    <tr>
      <td style="padding:48px 48px 0;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;line-height:72px;display:block;">✅</span>
        </div>
        <h2 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;font-family:Georgia,serif;">Booking Request Received!</h2>
        <p style="margin:0;font-size:16px;color:#64748b;line-height:1.6;">
          Hi <strong style="color:#0f172a;">${data.name}</strong>, thank you for reaching out!<br/>
          Your booking request has been submitted and is under review.
        </p>
      </td>
    </tr>

    <!-- Confirmation Number Badge -->
    <tr>
      <td style="padding:28px 48px 0;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_COLOR});border-radius:12px;padding:20px 40px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Confirmation Number</p>
          <p style="margin:0;font-size:24px;font-weight:800;color:#ffffff;font-family:'Courier New',monospace;letter-spacing:2px;">${data.confirmationNumber}</p>
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Keep this number for your records</p>
      </td>
    </tr>

    <!-- Booking Summary -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_COLOR};padding-left:12px;">Booking Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('🎭', 'Service', data.serviceLabel)}
          ${detailRow('📅', 'Date', formattedDate)}
          ${detailRow('🕐', 'Time Slot', data.timeSlot || 'To be confirmed')}
          ${data.price ? detailRow('💰', 'Estimated Price', data.price) : ''}
          ${detailRow('👤', 'Name', data.name)}
          ${detailRow('📧', 'Email', data.email)}
          ${data.phone ? detailRow('📞', 'Phone', data.phone) : ''}
          ${data.message ? detailRow('💬', 'Additional Notes', data.message) : ''}
        </table>
      </td>
    </tr>

    <!-- Payment Instructions -->
    <tr>
      <td style="padding:36px 48px 0;">
        <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-radius:12px;padding:24px;">
          <h3 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#92400e;">💳 Payment Instructions</h3>
          <p style="margin:0 0 12px;font-size:14px;color:#78350f;line-height:1.6;">
            No payment is required at this stage. Once your booking is reviewed and confirmed, you will receive a separate email with:
          </p>
          <ul style="margin:0;padding-left:20px;font-size:14px;color:#78350f;line-height:1.8;">
            <li>Final pricing breakdown</li>
            <li>Deposit amount (typically 25–50%)</li>
            <li>Accepted payment methods (bank transfer, PayPal, or card)</li>
            <li>Payment deadline before the event</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- What Happens Next -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_ACCENT};padding-left:12px;">What Happens Next?</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:0 0 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">1</div>
                  </td>
                  <td valign="top" style="padding-left:12px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Review (within 24 hours)</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">We'll review your request and check availability for your selected date and time.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">2</div>
                  </td>
                  <td valign="top" style="padding-left:12px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Confirmation Email</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">You'll receive a confirmation email to <strong>${data.email}</strong> with final details and payment instructions.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">3</div>
                  </td>
                  <td valign="top" style="padding-left:12px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Finalize &amp; Pay Deposit</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Agree on final details, sign the agreement, and pay the deposit to secure your booking.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40" valign="top">
                    <div style="width:32px;height:32px;background:${BRAND_ACCENT};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">🎉</div>
                  </td>
                  <td valign="top" style="padding-left:12px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Get Ready!</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Once everything is set, you'll receive all the logistics and details needed for your event.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td style="padding:36px 48px 48px;text-align:center;">
        <a href="${SITE_URL}/my-bookings" style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_COLOR});color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;">View My Bookings</a>
        <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
          Questions? Reply to this email or <a href="${SITE_URL}/contact" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">contact us here</a>.
        </p>
      </td>
    </tr>
  `);

  return { subject, html };
}

// ─────────────────────────────────────────────
// ADMIN NEW BOOKING EMAIL
// ─────────────────────────────────────────────
export interface AdminBookingData {
  confirmationNumber: string;
  name: string;
  email: string;
  phone?: string;
  serviceLabel: string;
  date: string;
  timeSlot: string;
  price: string;
  message?: string;
  bookingId?: string | number;
}

export function adminNewBookingEmail(data: AdminBookingData): { subject: string; html: string } {
  const subject = `📅 New Booking: ${data.serviceLabel} — ${data.name} (${data.confirmationNumber})`;

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Not specified';

  const html = baseLayout(`
    <!-- Alert Banner -->
    <tr>
      <td style="padding:0;">
        <div style="background:linear-gradient(135deg,#1e3a5f,${BRAND_COLOR});padding:24px 48px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">Admin Notification</p>
          <h2 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;">📅 New Booking Request</h2>
        </div>
      </td>
    </tr>

    <!-- Confirmation Badge -->
    <tr>
      <td style="padding:36px 48px 0;text-align:center;">
        <div style="display:inline-block;background:#f8fafc;border:2px solid ${BRAND_COLOR};border-radius:12px;padding:16px 32px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">Confirmation Number</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:${BRAND_COLOR};font-family:'Courier New',monospace;letter-spacing:2px;">${data.confirmationNumber}</p>
        </div>
      </td>
    </tr>

    <!-- Client Details -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_COLOR};padding-left:12px;">Client Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('👤', 'Client Name', data.name)}
          ${detailRow('📧', 'Email', data.email)}
          ${data.phone ? detailRow('📞', 'Phone', data.phone) : ''}
        </table>
      </td>
    </tr>

    <!-- Booking Details -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_ACCENT};padding-left:12px;">Booking Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('🎭', 'Service Requested', data.serviceLabel)}
          ${detailRow('📅', 'Requested Date', formattedDate)}
          ${detailRow('🕐', 'Time Slot', data.timeSlot || 'Not specified')}
          ${data.price ? detailRow('💰', 'Estimated Price', data.price) : ''}
          ${data.message ? detailRow('💬', 'Client Notes', data.message) : ''}
        </table>
      </td>
    </tr>

    <!-- Payment Reminder -->
    <tr>
      <td style="padding:36px 48px 0;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;">
          <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#166534;">💳 Payment &amp; Next Steps</h4>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#15803d;line-height:1.8;">
            <li>Review availability for the requested date</li>
            <li>Send client a confirmation email with final pricing</li>
            <li>Collect deposit (25–50%) to secure the booking</li>
            <li>Update booking status in the admin dashboard</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- Action Buttons -->
    <tr>
      <td style="padding:36px 48px 48px;text-align:center;">
        <a href="${SITE_URL}/admin/bookings" style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_COLOR});color:#ffffff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;margin-right:12px;">Manage Booking</a>
        <a href="mailto:${data.email}" style="display:inline-block;background:#f8fafc;border:2px solid ${BRAND_COLOR};color:${BRAND_COLOR};padding:14px 40px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;">Reply to Client</a>
      </td>
    </tr>
  `);

  return { subject, html };
}


// ─────────────────────────────────────────────
// CLIENT BOOKING CONFIRMED EMAIL (admin confirms)
// ─────────────────────────────────────────────
export interface ClientStatusUpdateData {
  name: string;
  email: string;
  serviceLabel: string;
  date: string;
  timeSlot?: string;
  price?: string;
  bookingId?: string;
  cancellationReason?: string;
}

export function clientBookingConfirmedEmail(data: ClientStatusUpdateData): { subject: string; html: string } {
  const subject = `✅ Your Booking is Confirmed — ${data.serviceLabel}`;

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'To be confirmed';

  const html = baseLayout(`
    <!-- Hero Section -->
    <tr>
      <td style="padding:48px 48px 0;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;line-height:72px;display:block;">🎉</span>
        </div>
        <h2 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;font-family:Georgia,serif;">Your Booking is Confirmed!</h2>
        <p style="margin:0;font-size:16px;color:#64748b;line-height:1.6;">
          Hi <strong style="color:#0f172a;">${data.name}</strong>, great news!<br/>
          We've reviewed your request and confirmed your booking.
        </p>
      </td>
    </tr>

    <!-- Status Badge -->
    <tr>
      <td style="padding:28px 48px 0;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#166534,#16a34a);border-radius:12px;padding:16px 40px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;">Booking Status</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">✅ CONFIRMED</p>
        </div>
      </td>
    </tr>

    <!-- Booking Summary -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_COLOR};padding-left:12px;">Booking Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('🎭', 'Service', data.serviceLabel)}
          ${detailRow('📅', 'Date', formattedDate)}
          ${data.timeSlot ? detailRow('🕐', 'Time / Location', data.timeSlot) : ''}
          ${data.price ? detailRow('💰', 'Estimated Price', data.price) : ''}
          ${detailRow('👤', 'Name', data.name)}
          ${detailRow('📧', 'Email', data.email)}
        </table>
      </td>
    </tr>

    <!-- Payment Instructions -->
    <tr>
      <td style="padding:36px 48px 0;">
        <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-radius:12px;padding:24px;">
          <h3 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#92400e;">💳 Next Steps — Payment</h3>
          <p style="margin:0 0 12px;font-size:14px;color:#78350f;line-height:1.6;">
            To fully secure your booking, please arrange your deposit payment:
          </p>
          <ul style="margin:0;padding-left:20px;font-size:14px;color:#78350f;line-height:1.8;">
            <li>A deposit of 25–50% is required to lock in your date</li>
            <li>Accepted methods: bank transfer, PayPal, or card</li>
            <li>Full balance is due before the event date</li>
            <li>Reply to this email to arrange payment details</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- What Happens Next -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_ACCENT};padding-left:12px;">What Happens Next?</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="40" valign="top"><div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">1</div></td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Arrange Your Deposit</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Reply to this email to receive payment instructions and secure your date.</p>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="40" valign="top"><div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">2</div></td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Receive Event Logistics</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Once payment is confirmed, you'll receive all event logistics and preparation details.</p>
              </td>
            </tr></table>
          </td></tr>
          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="40" valign="top"><div style="width:32px;height:32px;background:${BRAND_ACCENT};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">🎉</div></td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Enjoy Your Event!</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">We'll be there to deliver an unforgettable experience for you and your guests.</p>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:36px 48px 48px;text-align:center;">
        <a href="${SITE_URL}/my-bookings" style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_COLOR});color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;">View My Bookings</a>
        <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
          Questions? Reply to this email or <a href="${SITE_URL}/contact" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">contact us here</a>.
        </p>
      </td>
    </tr>
  `);

  return { subject, html };
}

// ─────────────────────────────────────────────
// CLIENT BOOKING COMPLETED EMAIL (admin marks complete)
// ─────────────────────────────────────────────
export function clientBookingCompletedEmail(data: ClientStatusUpdateData): { subject: string; html: string } {
  const subject = `🌟 Thank You — Your Booking is Complete!`;

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Completed';

  const html = baseLayout(`
    <!-- Hero Section -->
    <tr>
      <td style="padding:48px 48px 0;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#fef9c3,#fde68a);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;line-height:72px;display:block;">🌟</span>
        </div>
        <h2 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;font-family:Georgia,serif;">Thank You, ${data.name}!</h2>
        <p style="margin:0;font-size:16px;color:#64748b;line-height:1.6;">
          Your booking has been marked as <strong style="color:#16a34a;">completed</strong>.<br/>
          It was a pleasure working with you!
        </p>
      </td>
    </tr>

    <!-- Status Badge -->
    <tr>
      <td style="padding:28px 48px 0;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);border-radius:12px;padding:16px 40px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;">Booking Status</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">🏁 COMPLETED</p>
        </div>
      </td>
    </tr>

    <!-- Booking Summary -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_COLOR};padding-left:12px;">Booking Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('🎭', 'Service', data.serviceLabel)}
          ${detailRow('📅', 'Event Date', formattedDate)}
          ${data.timeSlot ? detailRow('🕐', 'Time / Location', data.timeSlot) : ''}
          ${detailRow('👤', 'Name', data.name)}
          ${detailRow('📧', 'Email', data.email)}
        </table>
      </td>
    </tr>

    <!-- Feedback Request -->
    <tr>
      <td style="padding:36px 48px 0;">
        <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:20px;">⭐⭐⭐⭐⭐</p>
          <h3 style="margin:0 0 10px;font-size:16px;font-weight:700;color:#166534;">We'd Love Your Feedback!</h3>
          <p style="margin:0 0 16px;font-size:14px;color:#15803d;line-height:1.6;">
            Your experience matters to us. Share a testimonial or leave a review — it helps us grow and serve more clients like you.
          </p>
          <a href="${SITE_URL}/contact" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 32px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;">Leave a Review</a>
        </div>
      </td>
    </tr>

    <!-- Book Again -->
    <tr>
      <td style="padding:36px 48px 48px;text-align:center;">
        <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Ready for your next event? We'd love to work with you again!</p>
        <a href="${SITE_URL}/booking" style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_COLOR});color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;">Book Another Service</a>
        <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
          Questions? <a href="${SITE_URL}/contact" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Contact us here</a>.
        </p>
      </td>
    </tr>
  `);

  return { subject, html };
}

// ─────────────────────────────────────────────
// CLIENT BOOKING CANCELLED EMAIL (admin cancels)
// ─────────────────────────────────────────────
export function clientBookingCancelledEmail(data: ClientStatusUpdateData): { subject: string; html: string } {
  const subject = `Booking Cancellation Notice — ${data.serviceLabel}`;

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'N/A';

  const html = baseLayout(`
    <!-- Hero Section -->
    <tr>
      <td style="padding:48px 48px 0;text-align:center;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#fee2e2,#fecaca);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;line-height:72px;display:block;">😔</span>
        </div>
        <h2 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;font-family:Georgia,serif;">Booking Cancelled</h2>
        <p style="margin:0;font-size:16px;color:#64748b;line-height:1.6;">
          Hi <strong style="color:#0f172a;">${data.name}</strong>, we're sorry to inform you<br/>
          that your booking has been cancelled.
        </p>
      </td>
    </tr>

    <!-- Status Badge -->
    <tr>
      <td style="padding:28px 48px 0;text-align:center;">
        <div style="display:inline-block;background:linear-gradient(135deg,#991b1b,#dc2626);border-radius:12px;padding:16px 40px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;">Booking Status</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">❌ CANCELLED</p>
        </div>
      </td>
    </tr>

    <!-- Booking Summary -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid #ef4444;padding-left:12px;">Cancelled Booking Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('🎭', 'Service', data.serviceLabel)}
          ${detailRow('📅', 'Original Date', formattedDate)}
          ${data.timeSlot ? detailRow('🕐', 'Time / Location', data.timeSlot) : ''}
          ${detailRow('👤', 'Name', data.name)}
          ${detailRow('📧', 'Email', data.email)}
        </table>
      </td>
    </tr>

    ${data.cancellationReason ? `
    <!-- Cancellation Reason -->
    <tr>
      <td style="padding:0 48px;">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 24px;">
          <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#991b1b;">📋 Reason for Cancellation</h4>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${data.cancellationReason}</p>
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- Next Steps -->
    <tr>
      <td style="padding:36px 48px 0;">
        <h3 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;border-left:4px solid ${BRAND_COLOR};padding-left:12px;">What Can You Do Next?</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="40" valign="top"><div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">1</div></td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Rebook for a New Date</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">If you'd like to reschedule, you're welcome to submit a new booking request for a different date.</p>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="40" valign="top"><div style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">2</div></td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Get in Touch</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">If you have questions about this cancellation or need assistance, please don't hesitate to contact us.</p>
              </td>
            </tr></table>
          </td></tr>
          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="40" valign="top"><div style="width:32px;height:32px;background:${BRAND_ACCENT};border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#fff;">3</div></td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Explore Our Services</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Browse our full range of entertainment and creative services to find the perfect fit for your next event.</p>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:36px 48px 48px;text-align:center;">
        <a href="${SITE_URL}/booking" style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_COLOR});color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;margin-right:12px;">Book Again</a>
        <a href="${SITE_URL}/contact" style="display:inline-block;background:#f8fafc;border:2px solid ${BRAND_COLOR};color:${BRAND_COLOR};padding:14px 40px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;">Contact Us</a>
        <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">We hope to work with you again in the future!</p>
      </td>
    </tr>
  `);

  return { subject, html };
}
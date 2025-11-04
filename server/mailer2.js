const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

let transporter = null;
function getTransporter(){
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, DISABLE_EMAIL } = process.env;
  if (String(DISABLE_EMAIL) === '1'){
    console.warn('[mailer] Email disabled via DISABLE_EMAIL=1');
    return null;
  }
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS){
    console.warn('[mailer] SMTP env not fully configured; email sending is disabled.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
}

async function sendWishEmail(name, message){
  const tx = getTransporter();
  if (!tx) return; // no-op in dev when SMTP not set
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
      <h2 style="margin:0 0 8px">New Birthday Wish</h2>
      <p><b>From:</b> ${escapeHtml(name || 'Anonymous')}</p>
      <p style="white-space:pre-wrap"><b>Message:</b><br>${escapeHtml(message)}</p>
      <hr style=\"border:none;border-top:1px solid #eee;margin:12px 0\"/>
      <small>Sent from Mooky Wishes</small>
    </div>`;
  await tx.sendMail({
    from: process.env.FROM_EMAIL || 'no-reply@example.com',
    to: process.env.TO_EMAIL || 'test@example.com',
    subject: `🎂 New Birthday Wish from ${name || 'Anonymous'}`,
    html,
  });
}

module.exports = { sendWishEmail };

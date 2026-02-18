//  utils/emailService.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendInterestEmail = async (toEmail, interestedUserName) => {
  try {
    await resend.emails.send({
      from: 'DevConnect <onboarding@resend.dev>',
      to: toEmail,
      subject: '💖 Someone is interested in you!',
      html: `
        <p>Hey!</p>
        <p><strong>${interestedUserName}</strong> is interested in you on DevConncet.</p>
        <p>Log in to check them out!</p>
      `,
    });
  } catch (err) {
    console.error('Resend error:', err);
    throw err;
  }
};

module.exports = { sendInterestEmail }; // CommonJS export
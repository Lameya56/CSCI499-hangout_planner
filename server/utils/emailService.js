//TESTING VERSION - Just logs to console
// export const sendInvitationEmail = async (invitation, plan, planTitle) => {
//   const inviteLink = `${process.env.FRONTEND_URL}/respond/${invitation.invite_token}`;
  
//   console.log('\n' + '='.repeat(60));
//   console.log('📧 INVITATION EMAIL');
//   console.log('='.repeat(60));
//   console.log(`To: ${invitation.email}`);
//   console.log(`Subject: 🎉 You're invited to: ${planTitle}`);
//   console.log(`Plan ID: ${plan.id}`);
//   console.log(`Deadline: ${new Date(plan.deadline).toLocaleString()}`);
//   console.log('\n🔗 INVITATION LINK:');
//   console.log(inviteLink);
//   console.log('\n' + '='.repeat(60) + '\n');
  
//   return Promise.resolve();
// };


// utils/emailService.js (COMPLETE VERSION)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendInvitationEmail = async (invitation, plan, planTitle) => {
  const inviteLink = `${process.env.FRONTEND_URL}/respond/${invitation.invite_token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: invitation.email,
    subject: `🎉 You're invited to: ${planTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <h2>${planTitle}</h2>
          </div>
          <div class="content">
            <p>Hey there! 👋</p>
            <p>You've been invited to join <strong>${planTitle}</strong>!</p>
            
            <div class="details">
              <h3>What's Next?</h3>
              <p>Click the button below to:</p>
              <ul>
                <li>✅ Vote on your preferred dates</li>
                <li>🎯 Choose activities you'd like to do</li>
                <li>💡 Suggest new activities</li>
              </ul>
              <p><strong>⏰ Please respond by:</strong> ${new Date(plan.deadline).toLocaleString()}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">
                Respond to Invitation
              </a>
            </div>
            
            <div class="footer">
              <p>Can't click the button? Copy this link:</p>
              <p style="word-break: break-all; color: #667eea;">${inviteLink}</p>
              <p style="margin-top: 20px; color: #999;">
                Note: You'll need to create an account or sign in to respond.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent to ${invitation.email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Log to console as backup
    console.log('\n📧 INVITATION LINK (Email failed, use this):');
    console.log(`To: ${invitation.email}`);
    console.log(`Link: ${inviteLink}\n`);
  }
};

const formatTime = (t) => {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(h, m);

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Sends a plan confirmation email.
 * @param {string} email - Recipient's email.
 * @param {object} plan - The plan object.
 * @param {string} confirmedDate - The confirmed date string.
 * @param {object} confirmedActivity - The confirmed activity object.
 * @param {string} invite_token - The invitee's token (null for host).
 * @param {boolean} isHost - Flag to hide respond button for the host.
 */
export const sendPlanConfirmationEmail = async (email, plan, confirmedDate, confirmedActivity, invite_token, isHost = false) => {
  const decideLink = `${process.env.FRONTEND_URL}/decide/${invite_token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `✅ Plan Confirmed: ${plan.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Plan Confirmed!</h1>
            <h2>${plan.title}</h2>
          </div>
          <div class="content">
            <p>Great news! The plan has been finalized based on everyone's votes.</p>
            
            <div class="details">
              <h3>📅 Event Details:</h3>
              <p><strong>Date:</strong> ${new Date(confirmedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> ${formatTime(plan.time)}</p>
              <p><strong>Activity:</strong> ${confirmedActivity.name}</p>
              <p><strong>Location:</strong> ${confirmedActivity.location}</p>
            </div>
            ${!isHost ? `
            <p>Click below to give your decision on the finalized plan:</p>   
            <div style="text-align: center;">
              <a href="${decideLink}" class="button">
                Click
              </a>
            </div>
            `:`
            <p style="text-align:center; font-style: italic;">As the host, your attendance is already confirmed. Enjoy!</p>
            `}
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
  }

};

/**
 * Sends a reminder to vote.
 */
export const sendReminderEmail = async (email, planTitle, deadline, inviteLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `⏰ Reminder: Don't forget to vote for ${planTitle}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #667eea;">Just a friendly reminder!</h2>
        <p>This is a reminder to cast your votes for the plan: <strong>${planTitle}</strong>.</p>
        <p>The deadline for voting is <strong>${new Date(deadline).toLocaleString()}</strong>, so make sure to get your votes in soon!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Vote Now
          </a>
        </div>
        <p style="font-size: 12px; color: #777;">If you can't click the button, copy this link: <br> ${inviteLink}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending reminder email:', error);
  }

};

/**
 * Sends a countdown email.
 */
export const sendCountdownEmail = async (email, plan, activity, daysRemaining) => {
  let subject = '';
  let heading = '';
  let message = '';

  const eventDateStr = new Date(plan.confirmed_date).toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  switch (daysRemaining) {
    case 7:
      subject = `🗓️ 1 Week Away: ${plan.title}!`;
      heading = `Only 1 Week Left!`;
      message = `Get ready! Our plan, <strong>${plan.title}</strong>, is just one week away, on ${eventDateStr}.`;
      break;
    case 3:
      subject = `🎉 3 Days Away: ${plan.title}!`;
      heading = `Just 3 Days to Go!`;
      message = `The excitement is building! <strong>${plan.title}</strong> is happening in 3 days on ${eventDateStr}.`;
      break;
    case 2:
      subject = `🤩 2 Days Away: ${plan.title}!`;
      heading = `Only 2 Days Left!`;
      message = `Almost time! <strong>${plan.title}</strong> is happening in 2 days on ${eventDateStr}.`;
      break;
    case 1:
      subject = `✨ Tomorrow: ${plan.title}!`;
      heading = `It's (Almost) Here!`;
      message = `<strong>${plan.title}</strong> is TOMORROW, ${eventDateStr}! We hope you're as excited as we are.`;
      break;
    case 0:
      subject = `🙌 Today is the Day: ${plan.title}!`;
      heading = `Today's the Day!`;
      message = `It's finally here! <strong>${plan.title}</strong> is happening today. See you there!`;
      break;
    default:
      return; // Don't send if not a milestone
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1>${heading}</h1>
          <h2>${plan.title}</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 1.1em;">${message}</p>
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3>📅 Event Details:</h3>
            <p><strong>Date:</strong> ${eventDateStr}</p>
            <p><strong>Time:</strong> ${plan.time}</p>
            <p><strong>Activity:</strong> ${activity.name}</p>
            <p><strong>Location:</strong> ${activity.location}</p>
          </div>
          <p style="text-align:center; font-style: italic; color: #555;">Get ready for a great time!</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ ${daysRemaining}-day countdown email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending ${daysRemaining}-day countdown email:`, error);
  }
};

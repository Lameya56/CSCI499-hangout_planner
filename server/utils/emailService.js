//TESTING VERSION - Just logs to console
export const sendInvitationEmail = async (invitation, plan, planTitle) => {
  const inviteLink = `${process.env.FRONTEND_URL}/respond/${invitation.invite_token}`;
  
  console.log('\n' + '='.repeat(60));
  console.log('📧 INVITATION EMAIL');
  console.log('='.repeat(60));
  console.log(`To: ${invitation.email}`);
  console.log(`Subject: 🎉 You're invited to: ${planTitle}`);
  console.log(`Plan ID: ${plan.id}`);
  console.log(`Deadline: ${new Date(plan.deadline).toLocaleString()}`);
  console.log('\n🔗 INVITATION LINK:');
  console.log(inviteLink);
  console.log('\n' + '='.repeat(60) + '\n');
  
  return Promise.resolve();
};


// utils/emailService.js (COMPLETE VERSION)
//import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// export const sendInvitationEmail = async (invitation, plan, planTitle) => {
//   const inviteLink = `${process.env.FRONTEND_URL}/respond/${invitation.invite_token}`;
  
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: invitation.email,
//     subject: `🎉 You're invited to: ${planTitle}`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
//           .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
//           .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
//           .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
//           .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>🎉 You're Invited!</h1>
//             <h2>${planTitle}</h2>
//           </div>
//           <div class="content">
//             <p>Hey there! 👋</p>
//             <p>You've been invited to join <strong>${planTitle}</strong>!</p>
            
//             <div class="details">
//               <h3>What's Next?</h3>
//               <p>Click the button below to:</p>
//               <ul>
//                 <li>✅ Vote on your preferred dates</li>
//                 <li>🎯 Choose activities you'd like to do</li>
//                 <li>💡 Suggest new activities</li>
//               </ul>
//               <p><strong>⏰ Please respond by:</strong> ${new Date(plan.deadline).toLocaleString()}</p>
//             </div>
            
//             <div style="text-align: center;">
//               <a href="${inviteLink}" class="button">
//                 Respond to Invitation
//               </a>
//             </div>
            
//             <div class="footer">
//               <p>Can't click the button? Copy this link:</p>
//               <p style="word-break: break-all; color: #667eea;">${inviteLink}</p>
//               <p style="margin-top: 20px; color: #999;">
//                 Note: You'll need to create an account or sign in to respond.
//               </p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Invitation email sent to ${invitation.email}`);
//   } catch (error) {
//     console.error('❌ Error sending email:', error);
//     // Log to console as backup
//     console.log('\n📧 INVITATION LINK (Email failed, use this):');
//     console.log(`To: ${invitation.email}`);
//     console.log(`Link: ${inviteLink}\n`);
//   }
// };

export const sendPlanConfirmationEmail = async (email, plan, confirmedDate, confirmedActivity, invite_token) => {
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
              <p><strong>Time:</strong> ${plan.time}</p>
              <p><strong>Activity:</strong> ${confirmedActivity.name}</p>
              <p><strong>Location:</strong> ${confirmedActivity.location}</p>
            </div>
            
            <p>Click below to give your decision on the finalized plan:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/decide/${invite_token}" class="button">
                Click
              </a>
            </div>
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
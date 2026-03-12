// /**
//  * Nodemailer email configuration
//  * Sets up transporter for sending emails (temporary passwords, notifications)
//  */

// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import logger from '../utils/logger.js';

// dotenv.config();

// // Create reusable transporter object
// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVICE || 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // Verify connection configuration
// transporter.verify((error, success) => {
//   if (error) {
//     logger.error(`Email transporter verification failed: ${error.message}`);
//     console.error('Email configuration error:', error);
//   } else {
//     logger.info('Email server is ready to send messages');
//     console.log('Email server is ready');
//   }
// });

// /**
//  * Send email with specified options
//  * @param {Object} mailOptions - Email options (to, subject, html)
//  * @returns {Promise} Nodemailer send result
//  */
// export const sendEmail = async (mailOptions) => {
//   try {
//     const defaultFrom = process.env.EMAIL_USER;
//     const info = await transporter.sendMail({
//       from: `"Vehicle Terminal System" <${defaultFrom}>`,
//       ...mailOptions
//     });
    
//     logger.info(`Email sent: ${info.messageId}`);
//     return info;
//   } catch (error) {
//     logger.error(`Failed to send email: ${error.message}`);
//     throw new Error('Failed to send email notification');
//   }
// };

// /**
//  * Send temporary password email to new admin
//  * @param {String} email - Recipient email
//  * @param {String} tempPassword - Temporary password
//  * @param {String} name - Recipient name
//  */
// export const sendTemporaryPassword = async (email, tempPassword, name) => {
//   const subject = 'Your Vehicle Terminal System Account Credentials';
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #333;">Welcome to Vehicle Terminal Management System</h2>
//       <p>Hello ${name},</p>
//       <p>An account has been created for you. Please use the following credentials to log in:</p>
//       <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #eee; padding: 3px 6px;">${tempPassword}</span></p>
//       </div>
//       <p><strong>Important:</strong> You will be required to change this password on first login.</p>
//       <p>Login here: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
//       <p>For security reasons, do not share this password with anyone.</p>
//       <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
//       <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply.</p>
//     </div>
//   `;

//   return sendEmail({ to: email, subject, html });
// };

// export default transporter;
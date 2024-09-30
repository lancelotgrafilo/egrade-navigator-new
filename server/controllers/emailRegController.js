const nodemailer = require('nodemailer');
const { generateConfirmationCode } = require('../utils/confirmationCode');
const { setConfirmationCode } = require('../utils/confirmationStore');
const adminModel = require('../models/admin');

const { isEmailRegistered } = require('../utils/emailChecker');

const sendEmailRegister = async (req, res) => {
  const { email } = req.body;
  
  // Generate and store the confirmation code
  const confirmationCode = generateConfirmationCode();
  console.log(confirmationCode);
  setConfirmationCode(email, confirmationCode);

  try {

    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"eGrade Navigator" <egradenavigator@gmail.com>',
      to: email,
      subject: 'Confirmation Code',
      text: `
         Dear User,

        Thank you for registering with us!

        Here is your confirmation code: 
        Confirmation Code: ${confirmationCode}

        If you did not register for an account, please disregard this email or contact our support team.

        We're excited to have you with us!

        Best regards,
        The eGrade Navigator Team
      `,
      html: `
        <p>Dear User,</p>
        <p>Thank you for registering with us!</p>
        <p>Here is your confirmation code to verify your email address:</p>
        <p><strong>Confirmation Code: ${confirmationCode}</strong></p>
        <p>If you did not register for an account, please disregard this email or contact our support team.</p>
        <p>We're excited to have you with us!</p>
        <p>Best regards,<br>The eGrade Navigator Team</p>
      `
    });

    console.log('Message sent: %s', info.messageId);
    
    res.status(200).json({ message: "Email sent successfully", confirmationCode });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};

const sendRegisterCompleted = async (email) => {
  console.log('sendRegisterCompleted email:', email); // Debugging

  // Check if email is provided
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      throw new Error('Email already registered');
    }

    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"eGrade Navigator" <egradenavigator@gmail.com>',
      to: email,
      subject: 'Welcome to eGrade Navigator!',
      text: `
        Dear User,

        Thanks for registering with eGrade Navigator! Please wait for admin verification.

        We’re excited to have you!

        Best regards,
        The eGrade Navigator Team
      `,
      html: `
        <p>Dear User,</p>
        <p>Thanks for registering with eGrade Navigator! Please wait for admin verification.</p>
        <p>We’re excited to have you!</p>
        <p>Best regards,<br>The eGrade Navigator Team</p>
      `
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to be caught in calling function
  }
};


const sendApprovalEmail = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let info = await transporter.sendMail({
      from: '"eGrade Navigator" <egradenavigator@gmail.com>',
      to: email,
      subject: 'Registration Approved',
      text: `
        Dear User,

        Congratulations! Your registration with eGrade Navigator has been approved.

        You can now log in and start using our platform.

        Best regards,
        The eGrade Navigator Team
      `,
      html: `
        <p>Dear User,</p>
        <p>Congratulations! Your registration with eGrade Navigator has been approved.</p>
        <p>You can now log in and start using our platform.</p>
        <p>Best regards,<br>The eGrade Navigator Team</p>
      `
    });

    console.log('Approval email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error; // Re-throw to be caught in calling function
  }
};

const sendRejectionEmail = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let info = await transporter.sendMail({
      from: '"eGrade Navigator" <egradenavigator@gmail.com>',
      to: email,
      subject: 'Registration Rejected',
      text: `
        Dear User,

        We regret to inform you that your registration with eGrade Navigator has been rejected.

        If you have any questions or need further information, please contact our support team.

        Best regards,
        The eGrade Navigator Team
      `,
      html: `
        <p>Dear User,</p>
        <p>We regret to inform you that your registration with eGrade Navigator has been rejected.</p>
        <p>If you have any questions or need further information, please contact our support team.</p>
        <p>Best regards,<br>The eGrade Navigator Team</p>
      `
    });

    console.log('Rejection email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error; // Re-throw to be caught in calling function
  }
};


module.exports = { 
  sendEmailRegister,
  sendRegisterCompleted,
  sendApprovalEmail,
  sendRejectionEmail
};
const nodemailer = require('nodemailer');

const sendEmailSuccess = async ({ email, plainPassword }) => {
  console.log("sendEmailSuccess Initializing: ");
  
  console.log('Received in sendEmailSuccess:', { email, plainPassword });
  
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
      subject: 'Welcome to eGrade Navigator!',
      text: `
        Dear User,

        Congratulations! Your registration with eGrade Navigator is successful.

        Here are your login details:
        Email: ${email}
        Password: ${plainPassword}
        
        Note: Please avoid refreshing the page during registration, as this may cause issues with your account setup.

        Link: https://egrade-frontend.onrender.com

        For your security, please log in to your account and change your password as soon as possible.

        If you did not register for this account, please ignore this email or contact our support team immediately.

        Welcome aboard, and thank you for joining eGrade Navigator!

        Best regards,
        The eGrade Navigator Team
      `,
      html: `
        <p>Dear User,</p>
        <p>Congratulations! Your registration with eGrade Navigator is successful.</p>
        <p>Here are your login details:</p>
        <p>Email: <strong>${email}</strong></p>
        <p>Password: <strong>${plainPassword}</strong></p>
        <p>Note: Please avoid refreshing the page during registration, as this may cause issues with your account setup.</p>
        <p>Link: <strong>https://egrade-frontend.onrender.com</strong> </p>
        <p>For your security, please log in to your account and change your password as soon as possible.</p>
        <p>If you did not register for this account, please ignore this email or contact our support team immediately.</p>
        <p>Welcome aboard, and thank you for joining eGrade Navigator!</p>
        <p>Best regards,<br>The eGrade Navigator Team</p>
      `
    });

    console.log('Message sent: %s', info.messageId);
    return { message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmailSuccess };

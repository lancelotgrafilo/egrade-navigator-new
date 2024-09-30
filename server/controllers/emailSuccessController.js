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


// const nodemailer = require('nodemailer');

// const sendEmailSuccess = async ({ email, generatedPassword, confirmationCode }) => {
//   console.log("sendEmailSuccess Initializing: ");
  
//   console.log('Received in sendEmailSuccess:', { email, generatedPassword, confirmationCode });
  
//   try {
//     // Create a Nodemailer transporter
//     let transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER, 
//         pass: process.env.EMAIL_PASS 
//       }
//     });

//     // Send mail with defined transport object
//     let info = await transporter.sendMail({
//       from: '"eGrade Navigator" <egradenavigator@gmail.com>',
//       to: email,
//       subject: 'Welcome to eGrade Navigator!',
//       text: `
//         Dear User,

//         Congratulations! Your registration with eGrade Navigator is successful.

//         Here are your login details:
//         Email: ${email}
//         Password: ${generatedPassword}

//         For your security, please log in to your account and change your password as soon as possible.

//         To complete your registration, please verify your email using the following confirmation code:
//         Confirmation Code: ${confirmationCode}

//         If you did not register for this account, please ignore this email or contact our support team immediately.

//         Welcome aboard, and thank you for joining eGrade Navigator!

//         Best regards,
//         The eGrade Navigator Team
//       `,
//       html: `
//         <p>Dear User,</p>
//         <p>Congratulations! Your registration with eGrade Navigator is successful.</p>
//         <p>Here are your login details:</p>
//         <p>Email: <strong>${email}</strong></p>
//         <p>Password: <strong>${generatedPassword}</strong></p>
//         <p>For your security, please log in to your account and change your password as soon as possible.</p>
//         <p>To complete your registration, please verify your email using the following confirmation code:</p>
//         <p><strong>Confirmation Code: ${confirmationCode}</strong></p>
//         <p>If you did not register for this account, please ignore this email or contact our support team immediately.</p>
//         <p>Welcome aboard, and thank you for joining eGrade Navigator!</p>
//         <p>Best regards,<br>The eGrade Navigator Team</p>
//       `
//     });

//     console.log('Message sent: %s', info.messageId);
//     return { message: 'Email sent successfully', code: confirmationCode };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw new Error('Error sending email');
//   }
// };

// module.exports = { sendEmailSuccess };

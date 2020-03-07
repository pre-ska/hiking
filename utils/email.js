//10-13
const nodemailer = require('nodemailer');

const sendEmail = async options => {
  console.log('ide sendEmail');
  // 1) create a transporter - service koji ce slati emailove... npr Gmail
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) define the email options
  const mailOptions = {
    from: 'pre ska <preska@email.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };

  // 3) send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

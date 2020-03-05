//10-13
const nodemailer = require('nodemailer')

const sendEmail = options => {
  // 1) create a transporter - service koji ce slati emailove... npr Gmail
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 
    }
  })

  // 2) define the email options

  // 3) send the email
}
//10-13
const nodemailer = require("nodemailer"); //10-13
const pug = require("pug"); //13-9
const htmlToText = require("html-to-text"); //13-9

//13-9
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `pre ska <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return 1;
    }

    //ako sam u developentu vrati nodemailer transport
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // ova metoda će poslati mail ovisno  argumentim , welcome, ili reset password
    // 1 - kreiraj HTML ovisno o PUG teplate-u.. ne radim res.render jer samo želim kreirati html, koji ću poslati kao mail
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html), // ovo je fallback ako html ne radi u mailu kod primatelja... neki ne žele html..moram cijeli html stripati od tagova...koristim html-to-text library
    };

    // 3 - create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", " Welcome to the Hiking family");
  }
};

//13-9 refactoring !!!!!!!!!!!!!! gore ovo
// const sendEmail = async options => {
// console.log('ide sendEmail');
// // 1) create a transporter - service koji ce slati emailove... npr Gmail
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// 2) define the email options 13-9
// const mailOptions = {
//   from: 'pre ska <preska@email.com>',
//   to: options.email,
//   subject: options.subject,
//   text: options.message
//   //html:
// };

// // 3) send the email
// await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail; maknio u 13-9

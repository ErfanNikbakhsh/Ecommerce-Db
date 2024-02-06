const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  // Define email options
  const emailOptions = {
    from: '"Digitic Support" <support@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
    html: option.htmlToSend,
  };

  // Why do we need the await keyword when sending the email?
  await transporter.sendMail(emailOptions);
};

module.exports = { sendEmail };

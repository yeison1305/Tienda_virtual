const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  console.log('Testing email configuration...');
  console.log('User:', process.env.EMAIL_USER);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"VOID Culture" <noreply@void.co>',
      to: process.env.EMAIL_USER, // send to oneself
      subject: 'Prueba de configuración de Nodemailer',
      text: 'Si estás viendo este correo, Nodemailer está funcionando correctamente!',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();

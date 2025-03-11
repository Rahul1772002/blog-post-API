import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL_ADDRESS,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

export default transport
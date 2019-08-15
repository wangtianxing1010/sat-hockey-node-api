import nodemailer from 'nodemailer';

const frm = '"Sat Hockey" <info@sathockey.com> '

function setup (){
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });
}

export function sendConfirmationEmail(user){
    const transport = setup();
    const email = {
        frm,
        to: user.email,
        subject: 'Welcome to Sat-hockey, please confirm your email',
        text: `
        Welcome, please click to the following link to confirm email: 

        ${user.generateConfirmationUrl()}
        `
    }

    transport.sendMail(email);
}

export function sendResetPasswordEmail(user){
  const transport = setup();
  const email = {
      frm,
      to: user.email,
      subject: 'Please reset your password',
      text: `
      Please click to the following link to reset password: 

      ${user.generateResetPasswordUrl()}
      `
  }

  transport.sendMail(email);
}
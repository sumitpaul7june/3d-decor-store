import nodemailer from "nodemailer";

const emailUser = (process.env.EMAIL || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").trim();

const transporter =
  emailUser && emailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      })
    : null;

export const canSendEmail = Boolean(transporter);

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter || !to) {
    return false;
  }

  await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    html,
    text,
  });

  return true;
};

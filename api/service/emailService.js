const nodemailer = require("nodemailer");

class EmailService {
  _transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
  });
  async sendEmails(emails) {
    for (let i = 0; i < emails.length; i++) {
      await this._transporter.sendMail({
        from: `"Monitoring Solution" <no-reply@monitoring.loc>`,
        subject: emails[i].subject,
        to: emails[i].email,
        text: emails[i].text,
      });
    }
  }
}

export default new EmailService();
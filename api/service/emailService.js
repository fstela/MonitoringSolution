const nodemailer = require("nodemailer");

class EmailService {
  _transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });
  async sendEmails(emails) {
    for (let i = 0; i < emails.length; i++) {
      await this._transporter.sendMail({
        from: `"Monitoring Solution" <floreastela19@stud.ase.ro>`,
        subject: emails[i].subject,
        to: emails[i].email,
        text: emails[i].text,
      });
    }
  }
}

module.exports = new EmailService();

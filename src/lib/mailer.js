const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "3efc2b7828a17c",
      pass: "b938c56e3f79a6"
    }
  });
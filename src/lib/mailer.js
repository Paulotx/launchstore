const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "c861b2ca8be25d",
        pass: "745417fe714ec6"
    }
});
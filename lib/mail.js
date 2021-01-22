const nodemailer = require("nodemailer"),
    fs = require("fs");

module.exports = class Mail {
    constructor() {
        this.smtp = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE.toLowerCase() === 'false' ? false : true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        //console.log("SMTP config\n", this.smtp);
    }

    sendEmail(data) {
        try {
            this.smtp.sendMail({
                    from: '"Bot tienda IQISS" <bounce@iqissmexico.com.mx>',
                    to: "ventas@iqissmexico.com.mx",
                    subject: `${data.name} se registro en el bot IQISS Tienda`,
                    html: ` <h1>Nuevo registro en el bot</h1><h4>Estos son los datos</h4><hr/>` +
                        `<p>Nombre: ${data.name}<br/>Telefono: <a href='https://wa.me/52${data.phone}' target='_blank'>${data.phone}</a><br/>E-mail: ${data.email}</p><hr/>` +
                        `<p>Llamalo lo mas pronto posible<br/>IQISS Bot</p>`,
                },
                (error, info) => {
                    if (error) {
                        fs.appendFile(
                            "log",
                            Date.now() +
                            "- Error in sendMail to send -" +
                            error.message +
                            "\n",
                            (err) => {
                                if (err) console.log(err);
                            }
                        );
                    }
                    this.smtp.close();
                }
            );
        } catch (error) {
            fs.appendFile(
                "log",
                Date.now() + "- Error in sendMail to try send mail -" + error + "\n",
                (err) => {
                    if (err) console.log(err);
                }
            );
        }
    }
};
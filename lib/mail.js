const nodemailer = require('nodemailer'),
    fs = require('fs');

module.exports = class Mail {
    constructor() {
        this.smtp = nodemailer.createTransport({
            host: "smtp.ionos.mx",
            port: 587,
            secure: false,
            auth: {
                user: "bounce@iqissmexico.com.mx",
                pass: "@Internet2.0",
            },
        });
    }

    sendEmail(data) {
        try {
            this.smtp.sendMail({
                from: '"Bot tienda IQISS" <bounce@iqissmexico.com.mx>',
                to: "ventas@iqissmexico.com.mx",
                subject: `${data.name} se registro en el bot IQISS Tienda`,
                html: ` <h1>Nuevo registro en el bot</h1><h4>Estos son los datos</h4><hr/>` +
                    `<p>Nombre: ${data.name}<br/>Telefono: ${data.phone}<br/>E-mail: ${data.email}</p><hr/>` +
                    `<p>Llamalo lo mas pronto posible<br/>IQISS Bot</p>`,
            }, (error, info) => {
                if (error) {
                    fs.appendFile('log', Date.now() + "- Error in sendMail to send -" + error.message, err => {
                        console.log(err);
                    });
                }
                this.smtp.close();
            });
        } catch (error) {
            fs.appendFile('log', Date.now() + "- Error in sendMail to try send mail -" + error, err => {
                console.log(err);
            });
        }
    }
}
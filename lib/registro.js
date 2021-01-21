const fs = require('fs'),
    sendMail = require('./mail');

module.exports = class RegistroClient {
    constructor(bot) {
        this.bot = bot;
        this.userArray = {};
    }

    async newCustomer(ctx) {
        try {
            if (ctx.chat.id !== ctx.from.id) {
                return ctx.reply.text(
                    "El registro se hace en privado, da click aqui -> @iqissAdminBot", { asReply: true }
                );
            }
            const users = fs.readFileSync('customers', 'utf8').split('\n');

            if (users.find(iduser => parseInt(iduser) === ctx.from.id)) {
                return ctx.reply.text(
                    "Usted ya realizo este registro"
                );
            }

            if (this.userArray[ctx.from.id] === undefined) {
                this.userArray[ctx.from.id] = {
                    status: 'name',
                    value: {},
                };
                return ctx.reply.text("¡Hola!, para iniciar escribe tu nombre completo.");
            } else {
                await ctx.reply.text("Aun tiene un registro pendiente...", { asReply: true });
                if (this.userArray[ctx.from.id].status === "name") {
                    return ctx.reply.text("Por favor tecle su nombre completo");
                } else if (this.userArray[ctx.from.id].status === "telefono") {
                    return ctx.reply.text("Por favor tecle su numero de telefono a 10 digitos");
                } else if (this.userArray[ctx.from.id].status === "email") {
                    return ctx.reply.text("Le falto teclear el E-mail");
                }
            }
        } catch (err) {
            console.log(err);
            fs.appendFile('log', Date.now() + `-[newCustomer] Error - ${err}`, err => {
                console.log(err);
            });
        }
    }

    takeDataUser(ctx) {
        try {
            if (this.userArray[ctx.from.id] !== undefined) {
                const text = ctx.text.toLowerCase().trim();

                if (this.userArray[ctx.from.id].status === "name") {
                    if (text.search(/^[a-záéíóúáéíóúÁâêîôûàèìòùñ]{2,}(\s[a-záéíóúáéíóúÁâêîôûàèìòùñ]{2,}){1,5}\s?$/gim) === -1) {
                        return ctx.reply.text(
                            `Su nombre no tiene un formato valido: \n` +
                            `-> Tecle solo letras y espacios.\n` +
                            `-> Almenos un nombre y un apellido.\n` +
                            `-> Las palabras por lo menos deben de tener 2 letras.`
                        );
                    }
                    this.userArray[ctx.from.id] = {
                        status: 'phone',
                        value: {
                            name: ctx.text.toLowerCase().trim()
                        },
                    };
                    return ctx.reply.text(`¡Muy bien ${ctx.text.toLowerCase()}!, ahora tu numero de telefono a 10 digitos.`);
                } else if (this.userArray[ctx.from.id].status === "phone") {
                    if (text.search(/^\d{3,}(\s|-)?\d{3}(\s|-)?\d{4}\s?$/gim) === -1) {
                        return ctx.reply.text(
                            `El numero telefonico no es correcto: \n` +
                            `-> 10 numeros seguidos.\n` +
                            `-> Puede usar este formato XXX XXX XXXX\n` +
                            `-> o este XXX-XXX-XXXX`
                        );
                    }
                    this.userArray[ctx.from.id] = {
                        status: 'email',
                        value: {
                            ...this.userArray[ctx.from.id].value,
                            phone: ctx.text.trim()
                        },
                    };
                    return ctx.reply.text(`${this.userArray[ctx.from.id].value.name}, ahora tu e-mail.`);
                } else if (this.userArray[ctx.from.id].status === "email") {
                    if (text.search(/^(\w|\.|-)+@(\w|-|.)+\.\w{2,3}\s?$/gim) === -1) {
                        return ctx.reply.text(
                            `El e-mail no tiene un formato correcto: \n` +
                            `-> No use espacios.\n` +
                            `-> Debe de tarminar en .XX o .XXX\n` +
                            `-> Debe de llevar una @`
                        );
                    }
                    this.userArray[ctx.from.id] = {
                        status: 'end',
                        value: {
                            ...this.userArray[ctx.from.id].value,
                            email: ctx.text.toLowerCase().trim()
                        },
                    };
                    const mail = new sendMail();
                    mail.sendEmail(this.userArray[ctx.from.id].value);
                    ctx.reply.text(`Muchas gracias ${this.userArray[ctx.from.id].value.name}, nos pondremos en contacto contigo a la brevedad.`);
                    fs.appendFile('customers', `${ctx.from.id}\n`, err => {
                        console.log(err);
                    });
                    delete this.userArray[ctx.from.id];
                    return ctx.reply.text(`Visitanos en https://tienda.iqissmexico.com.mx`);
                }
            }
        } catch (err) {
            console.log(err);
            fs.appendFile('log', Date.now() + `-[takeDataUSer] error - ${err}`, err => {
                console.log(err);
            });
        }

    }

}
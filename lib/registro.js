const fs = require("fs"),
    sendMail = require("./mail");

module.exports = class RegistroClient {
    constructor(bot) {
        this.bot = bot;
        this.userArray = {};
    }

    async newCustomer(ctx) {
        try {
            if (ctx.chat.id !== ctx.from.id) {
                ctx.reply.text(
                    "<b>El registro de comerciantes</b> se hace en privado para no hacer spam.\nMandame un mensaje directo aqui -> (:: @iqissAdminBot ::)", { asReply: true, parseMode: 'HTML' }
                );
                return this.bot.sendMessage(ctx.from.id, `<b>¡Hola aqui estoy!</b>`, { parseMode: 'HTML' });
            }
            const users = fs.readFileSync("customers", "utf8").split("\n");
            if (users.find((iduser) => parseInt(iduser) === ctx.from.id)) {
                return ctx.reply.text("<i>Usted ya se registro,</i> <b>¿desea volver hacerlo?</b>", {
                    replyMarkup: {
                        inline_keyboard: [
                            [{
                                    text: 'Si',
                                    callback_data: "si_deleteRegister"
                                },
                                {
                                    text: 'No',
                                    callback_data: "no_deleteRegister"
                                }
                            ]
                        ]
                    },
                    parseMode: 'HTML'
                });
            }

            if (this.userArray[ctx.from.id] === undefined) {
                this.userArray[ctx.from.id] = {
                    status: "name",
                    value: {},
                };
                return ctx.reply.text(
                    "<b>¡Hola!</b>, <i>para iniciar escriba su nombre completo.</i>", { parseMode: 'HTML' }
                );
            } else {
                await ctx.reply.text("<b>::::: ¡Aun tiene un registro pendiente!</b>", { parseMode: 'HTML' });
                //console.log("\n[Mensaje enviado]:::::::::::>\n", this.userArray[ctx.from.id].status);
                if (this.userArray[ctx.from.id].status === "name") {
                    return ctx.reply.text("<i>Por favor escriba su nombre completo</i>", { parseMode: 'HTML' });
                } else if (this.userArray[ctx.from.id].status === "phone") {
                    return ctx.reply.text(
                        "<i>Por favor escriba su numero de telefono a 10 digitos</i>", { parseMode: 'HTML' }
                    );
                } else if (this.userArray[ctx.from.id].status === "email") {
                    return ctx.reply.text("<i>Falto escribir su correo electronico</i>", { parseMode: 'HTML' });
                }
                return false;
            }
        } catch (err) {
            console.log(err);
            fs.appendFile(
                "log",
                Date.now() + `-[newCustomer] Error - ${err}\n`,
                (err) => {
                    if (err) console.log(err);
                }
            );
        }
    }

    async takeDataUser(ctx) {
        try {
            if (this.userArray[ctx.from.id] !== undefined) {
                const text = ctx.text.toLowerCase().trim();

                if (this.userArray[ctx.from.id].status === "name") {
                    if (
                        text.search(
                            /^[a-záéíóúáéíóúÁâêîôûàèìòùñ]{2,}(\s[a-záéíóúáéíóúÁâêîôûàèìòùñ]{2,}){1,5}\s?$/gim
                        ) === -1
                    ) {
                        return ctx.reply.text(
                            `<b>Su nombre NO tiene un formato valido:</b>\n` +
                            `-> Escriba solo letras y espacios.\n` +
                            `-> Almenos un nombre y un apellido.\n` +
                            `-> Los nombres por lo menos deben de tener 2 letras.`, { parseMode: 'HTML' }
                        );
                    }
                    this.userArray[ctx.from.id] = {
                        status: "phone",
                        value: {
                            name: ctx.text.toLowerCase().trim(),
                        },
                    };
                    return ctx.reply.text(
                        `¡Muy bien <b>${ctx.text.toLowerCase()}</b>!, <i>ahora su numero de telefono a 10 digitos.</i>`, { parseMode: 'HTML' }
                    );
                } else if (this.userArray[ctx.from.id].status === "phone") {
                    if (text.search(/^\d{3,}(\s|-)?\d{3}(\s|-)?\d{4}\s?$/gim) === -1) {
                        return ctx.reply.text(
                            `<b>Su numero telefonico no es correcto:</b>\n` +
                            `-> Escriba 10 numeros seguidos.\n` +
                            `-> Puede usar este formato XXX XXX XXXX\n` +
                            `-> o este XXX-XXX-XXXX`, { parseMode: 'HTML' }
                        );
                    }
                    this.userArray[ctx.from.id] = {
                        status: "email",
                        value: {
                            ...this.userArray[ctx.from.id].value,
                            phone: ctx.text.trim(),
                        },
                    };
                    return ctx.reply.text(
                        `<b>${this.userArray[ctx.from.id].value.name}</b>, por último su correo electronico.`, { parseMode: 'HTML' }
                    );
                } else if (this.userArray[ctx.from.id].status === "email") {
                    if (text.search(/^(\w|\.|-)+@(\w|-|.)+\.\w{2,3}\s?$/gim) === -1) {
                        return ctx.reply.text(
                            `<b>Su e-mail no tiene un formato correcto:</b>\n` +
                            `-> No use espacios.\n` +
                            `-> Debe de tarminar en .XX o .XXX\n` +
                            `-> Debe de llevar una @`, { parseMode: 'HTML' }
                        );
                    }
                    this.userArray[ctx.from.id] = {
                        status: "end",
                        value: {
                            ...this.userArray[ctx.from.id].value,
                            email: ctx.text.toLowerCase().trim(),
                        },
                    };
                    const mail = new sendMail();
                    mail.sendEmail(this.userArray[ctx.from.id].value);
                    await ctx.reply.text(
                        `<b>Muchas gracias ${this.userArray[ctx.from.id].value.name}</b>, <i>nos pondremos en contacto con usted a la brevedad.</i>`, { parseMode: 'HTML' }
                    );
                    fs.appendFile("customers", `${ctx.from.id}\n`, (err) => {
                        if (err) console.log(err);
                    });
                    delete this.userArray[ctx.from.id];
                    return ctx.reply.text(
                        `<i>Visitanos en nuestro</i> <a href="https://tienda.iqissmexico.com.mx">sitio Web</a>.`, { parseMode: 'HTML' }
                    );
                }
            }
        } catch (err) {
            console.log(err);
            fs.appendFile(
                "log",
                Date.now() + `-[takeDataUSer] error - ${err}--DATA--${this.userArray[ctx.from.id]}\n`,
                (err) => {
                    if (err) console.log(err);
                }
            );
        }
    }
};
const fs = require("fs"),
    fetch = require("node-fetch");

module.exports = class Contactos {
    constructor(bot) {
        this.bot = bot;
    }

    async searchContacts(ctx) {
        const text = ctx.text.toLowerCase(),
            arg = text.split(" "),
            urltienda = process.env.URL_BASE;
        try {
            let search = "";
            if (arg && arg.length === 2) {
                search = arg[1];
            } else if (arg && arg.length > 2) {
                await arg.forEach((text, i) => {
                    if (i) {
                        search += !search ? text.trim() : ` ${text.trim()}`;
                    }
                });
            }
            search = encodeURI(search);

            if (!search) {
                return ctx.reply.text(
                    "Despues de comando <b>/contacto</b>, <i>deje un espacio y escriba lo que quiere buscar.</i>", { asReply: true, parseMode: 'HTML' }
                );
            }

            const url =
                `${urltienda}/api/customers/?ws_key=B86K9QLUXF42JC9DTPVX1IUKR5UDLVF3&` +
                `display=[note]&filter[note]=%[${search}]%&filter[active]=1&output_format=JSON`;
            ctx.reply.text("<b>Buscando contactos...</b>", { parseMode: 'HTML' });
            const iqiss = await fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    return data;
                })
                .catch((err) => {
                    fs.appendFile(
                        "log",
                        Date.now() + `[Buscar] Error al recuperar datos de API: ${err}\n`,
                        (err) => {
                            console.log(err);
                        }
                    );
                }),
                contacts = iqiss.customers,
                countContacts = iqiss && contacts ? contacts.length : 0;

            let telefono = "",
                empresa = "",
                data = {};

            await ctx.reply.text(`<i>Contactos encontrados: ${countContacts}</i>`, {
                asReply: true,
                parseMode: 'HTML'
            });
            //console.log(items, countItems);
            if (iqiss && countContacts) {
                contacts.map((item) => {
                    data = JSON.parse(item.note);
                    empresa = data.nombre;
                    telefono = data.telefono;
                    //console.log("Item: ", data);
                    return this.bot.sendContact(
                        ctx.chat.id,
                        telefono,
                        empresa
                    );
                });
            } else {
                return fs.appendFile(
                    "Contactos_failers",
                    Date.now() + `[Contacts] La busqueda de ${search} no tubo resultados\n`,
                    (err) => {
                        console.log(err);
                    }
                );
            }
        } catch (e) {
            console.log(e);
            fs.appendFile(
                "log",
                Date.now() + "-[Contactos] Error catcheado -" + e + "\n",
                (err) => {
                    console.log(err);
                }
            );
            return ctx.reply.text(
                `La conexion no esta disponible, intentalo más tarde.`
            );
        }
    }
};
const fs = require('fs'),
    fetch = require('node-fetch');

module.exports = class Buscar {
    constructor(bot) {
        this.bot = bot;
    }

    async itemInfo(ctx) {
        const text = ctx.text.toLowerCase(),
            arg = text.split(/\s/gm),
            urltienda = "https://tienda.iqissmexico.com.mx";
        try {
            let search = "";
            if (arg && arg.length === 2) {
                search = arg[1];
            } else if (arg && arg.length > 2) {
                arg.forEach((text, i) => {
                    if (i) {
                        search += !search ? text.trim() : ` ${text.trim()}`;
                    }
                });
            }
            search = encodeURI(search);

            if (!search) {
                return ctx.reply.text("Despues de comando /buscar, escriba el nombre del producto a enviar.", { asReply: true });
            }

            const url = `${urltienda}/api/search/?ws_key=B86K9QLUXF42JC9DTPVX1IUKR5UDLVF3&` +
                `display=full&query=[${search}]&language=2&output_format=JSON`;
            ctx.reply.text("Buscando producto...");
            const iqiss = await fetch(url)
                .then(res => res.json())
                .then(data => {
                    return data;
                })
                .catch(err => {
                    fs.appendFile('log', Date.now() + `Error al recuperar datos de API: ${err}`, err => {
                        console.log(err);
                    });
                }),
                items = iqiss.products,
                countItems = iqiss && items ? items.length : 0;

            let name = "",
                price = 0;

            await ctx.reply.text(`Articulos encontrados: ${countItems}`, { asReply: true });
            //console.log(items, countItems);
            if (iqiss && countItems) {
                items.map(item => {
                    let category = "belleza";
                    if (item.id_category_default === "3") category = "papeleria";
                    name = item.name;
                    price = parseFloat(item.price);
                    price = this.humanizeNumber((price * 1.16).toFixed(2));
                    //console.log("Item: ", item.link_rewrite, category);

                    return ctx.reply.text(
                        `${name}: $ ${price}\n` +
                        `${urltienda}/${category}/${item.id}-${item.link_rewrite}.html`
                    );
                });
            } else {
                fs.appendFile('log', Date.now() + `El producto ${search} no existe en la base de datos`, err => {
                    console.log(err);
                });
                return ctx.reply.text(`Para mas productos visita: ${urltienda}`);
            }
        } catch (e) {
            console.log(e);
            fs.appendFile('log', Date.now() + "- Error in command /quiero -" + e, err => {
                console.log(err);
            });
            return ctx.reply.text(`La conexion no esta disponible, por favor visitanos en: ${urltienda}`);
        }
    }

    humanizeNumber = (n) => {
        n = n.toString()
        while (true) {
            var n2 = n.replace(/(\d)(\d{3})($|,|\.)/g, '$1,$2$3')
            if (n == n2) break
            n = n2
        }
        return n
    };
}
require("dotenv").config();
const TeleBot = require("telebot"),
    bot = new TeleBot(process.env.BOT_TOKEN_IQISS),
    fs = require("fs"),
    comandSearch = require("./lib/buscar"),
    searchItem = new comandSearch(bot),
    comandRegister = require("./lib/registro"),
    registerCustomer = new comandRegister(bot),
    comandContact = require("./lib/contactos"),
    contacts = new comandContact(bot);

//Comandos
bot.on(["/start", "/Start"], (ctx) => {
    return ctx.reply.text(
        "<b>Bienvenido a IQISS Tienda</b>\n\n\nPor favor escriba el comando /ayuda <i>para más información de los comandos.</i>\n\nEscriba el comando /registro <i>para registrase en el directorio de comerciantes.</i>", { parseMode: 'HTML' }
    );
});
bot.on(["/ayuda", "/Ayuda"], (ctx) => {
    return ctx.reply.text(
        "<b>Los comando de este Bot son:</b>\n\n\n" +
        "/start - <i>Inicia el robot.</i>\n\n" +
        "/ayuda - <i>Muestra los comandos disponibles</i>\n\n" +
        "/buscar - <i>Busca un producto</i>\n\n" +
        "/registro - <i>Registra usuarios como comerciante.</i>\n\n" +
        "/contacto - <i>Buscar contactos</i>\n\n" +
        "/wa - <i>Crear un enlace de WhatsApp</i>", { parseMode: 'HTML' }
    );
});
bot.on(["/registro", "/Registro", "/Registrar", "/registrar"], async(ctx) => {
    try {
        bot.deleteMessage(ctx.chat.id, ctx.message_id);
        return registerCustomer.newCustomer(ctx);
    } catch (err) {
        console.log(err);
    }
});
bot.on(["/buscar", "/Buscar", "/Busco", "/busco"], (ctx) => {
    return searchItem.itemInfo(ctx);
});
bot.on(["/contacto", "/Contacto", "/contactos", "/Contactos"], (ctx) => {
    return contacts.searchContacts(ctx);
});
bot.on("/wa", (ctx) => {
    const text = ctx.text.toLowerCase().replace("/wa ", "").trim();
    if (text.search(/^\d{3,}\s?$/gim) === -1) {
        return ctx.reply.text(
            `El numero telefonico no es correcto: \n` +
            `-> Solo utilice 10 numeros seguidos.`
        );
    }
    if (text.length === 10) return ctx.reply.text(`<a href="https://wa.me/52${text}">Abrir en WhatsApp</a>`, { parseMode: 'HTML' });
});
//Events
bot.on("newChatMembers", (ctx) => {
    let username = ctx.new_chat_member.username ?
        ctx.new_chat_member.username :
        null;
    console.log(ctx);
    if (!username) {
        username = ctx.from.first_name ? ctx.from.first_name : "";
        username += ctx.from.last_name ? ` ${ctx.from.last_name}` : "";
    }

    return ctx.reply.text(
        `<b>Bienvenido al grupo ${username}</b>, para ver mis comandos escribe /ayuda\n\n-> Usa el comando /registro si tienes interes en registrarte en el directorio de comerciantes`, { asReply: true, parseMode: 'HTML' }
    );
});
bot.on("leftChatMember", (ctx) => {
    let username = ctx.left_chat_member.username ?
        ctx.left_chat_member.username :
        null;
    if (!username) {
        username = ctx.from.first_name ? ctx.from.first_name : "";
        username += ctx.from.last_name ? ` ${ctx.from.last_name}` : "";
    }
    fs.appendFile(
        "log",
        Date.now() + `-[Grupos] El usuario ${username}, se ha ido del grupo\n`,
        (err) => {
            console.log(err);
        }
    );
    return false;
});

//Texting
bot.on("text", ctx => {
    const text = ctx.text.toLowerCase();
    if (text.search(/^\/.+/gim) !== -1) {
        return false;
    }
    if (ctx.chat.id !== ctx.from.id) {
        return false;
    }
    return registerCustomer.takeDataUser(ctx);
});

//Actions
bot.on("callbackQuery", async ctx => {
    try {
        //console.log(ctx.message.chat.id, ctx.message.message_id);
        bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
        if (ctx.data === "si_deleteRegister") {
            const users = fs.readFileSync("customers", "utf8").split("\n"),
                UsersDone = await users.map(user => {
                    if (parseInt(user.trim()) !== ctx.from.id && user.trim() !== "") {
                        return user.trim();
                    }
                });
            fs.writeFile('customers', '', err => {
                if (err) console.log('done')
            });
            const ok = UsersDone.map(user => {
                if (user !== undefined && user !== "undefined") {
                    fs.appendFile(
                        "customers",
                        `${user}\n`,
                        (err) => {
                            if (err) console.log(err);
                        }
                    );
                }
            });
            //console.log(ctx);
            return bot.sendMessage(ctx.from.id, '<b>¡Registro eliminado correctamente!</b>\n<i>Inicie de nuevo el registro.</i>', { parseMode: 'HTML' });
        }
        return false;
    } catch (err) {
        console.log(err);
    }
});

bot.start();
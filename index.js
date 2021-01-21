require('dotenv').config();
const TeleBot = require('telebot'),
    bot = new TeleBot(process.env.BOT_TOKEN_IQISS),
    fs = require('fs'),
    comandSearch = require('./lib/buscar'),
    searchItem = new comandSearch(bot),
    comandRegister = require('./lib/registro'),
    registerCustomer = new comandRegister(bot);

//Comandos
bot.on(["/start", "/Start"], ctx => {
    return ctx.reply.text('Bienvenido a IQISS Tienda\n\n\nPor favor tecle el comando /ayuda, para más información de los comandos.\n\nTecle el comando /registro para registrase como vendedor.');
});
bot.on(["/ayuda", "/Ayuda"], ctx => {
    return ctx.reply.text(
        'Los comando de este Bot son: \n\n\n' +
        '/start - Inicia el robot.\n\n' +
        '/ayuda - Muestra los comandos disponibles\n\n' +
        '/buscar - Busca un producto\n\n' +
        '/registro - Registra usuarios como vendedor\n\n' +
        '/wa - Crear un enlace de WhatsApp'
    );
});
bot.on(['/registro', '/Registro', '/Registrar', '/registrar'], async ctx => {
    return registerCustomer.newCustomer(ctx);
});
bot.on(['/buscar', '/Buscar', 'Busco', '/busco'], ctx => {
    return searchItem.itemInfo(ctx);
});
bot.on('/wa', ctx => {
    const text = ctx.text.toLowerCase().replace('/wa ', '').trim();
    if (text.search(/^\d{3,}\s?$/gim) === -1) {
        return ctx.reply.text(
            `El numero telefonico no es correcto: \n` +
            `-> Solo utilice 10 numeros seguidos.`
        );
    }
    if (text.length === 10) return ctx.reply.text(`https://wa.me/52${text}`);
});
//Events
bot.on('newChatMembers', ctx => {
    let username = ctx.left_chat_member.username ? ctx.left_chat_member.username : null;
    if (!username) {
        username = ctx.new_chat_member.first_name ? ctx.new_chat_member.first_name : "";
        username += ctx.new_chat_member.last_name ? ` ${ctx.new_chat_member.last_name}` : "";
    }
    return ctx.reply.text(`Bienvenido al grupo ${username}, para ver mis comandos solo teclea /ayuda \n -> Teclea /registro si tienes interes en vender aqui.`, { asReply: true });
});
bot.on('leftChatMember', ctx => {
    let username = ctx.left_chat_member.username ? ctx.left_chat_member.username : null;
    if (!username) {
        username = ctx.left_chat_member.first_name ? ctx.left_chat_member.first_name : "";
        username += ctx.left_chat_member.last_name ? ` ${ctx.left_chat_member.last_name}` : "";
    }
    fs.appendFile('log', Date.now() + `-[Grupos] El usuario ${username}, se ha ido del grupo`, err => {
        console.log(err);
    });
    return false;
});

//Texting
bot.on("text", ctx => {
    const text = ctx.text.toLowerCase();
    if (text.search(/^\/.+/gim) !== -1) {
        return false;
    }
    return registerCustomer.takeDataUser(ctx);
});

bot.start();
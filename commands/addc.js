const helper = require('../helper.js');
const util = require('util');

module.exports = {
    aliases: ['addc', 'addalias'],
    usage: '%saddc <command> <alias>',
    async run(client, message, args) {
        try {
            if (!args || !args[0] || !args[1]) return await helper.sendMessage(message.channel, util.format(this.usage, message.guild.db.prefix));

            let command = message.guild.db.commands.find(command => command.command == args[0]);
            if (!command) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('addc_noargs', message.guild.db.lang), args[0]));
        } catch (err) { console.error(err); }
    }
}

/*
let command = message.guild.db.commands.find(command => command.command == args[0]);
            if (!command) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('addc_noargs', message.guild.db.lang), args[0]));
        }
        */
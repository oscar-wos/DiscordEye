const helper = require('../helper.js');
const util = require('util');

module.exports = {
  aliases: ['delc', 'delalias', 'removealias', 'deletealias'],
  usage: '%sdelc <command> <alias>',
  async run(client, message, args) {
    try {
      if (!args[0]) return helper.sendMessage(message.channel, util.format(this.usage, message.guild.db.prefix));
      
    } catch (err) { console.error(err); }
    
    //console.log('1');
    /*
      try {
          if (!args || !args[0] ) 

          let command = message.guild.db.commands.find(command => command.command == args[0]);
          if (!command) return helper.sendMessage(message.channel, util.format(helper.translatePhrase('addc_noargs', message.guild.db.lang), args[0]));
      } catch (err) { console.error(err); }
      */
  }
}
const config = require('../config.json');
const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['logs', 'l'],
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  run(client, message, args) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!args[1]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

        switch (args[1]) {
          case 'set': case 's': return resolve(await set(client, message, args));
          //case 'enable': case 'e': return enable(client, message, args);
          //case 'disable': case 'd': return disable(client, message, args);
          default: return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));
        }
      } catch { resolve(); }
    })
  }
}

function set(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_set_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let channel = await helper.resolveChannel(message, args[2], 'text', true);
      if (!channel) return;

      message.guild.db.log.channel = channel.id;
      message.guild.db.log.webhook = { id: null, token: null }

      if (channel.permissionsFor(message.guild.me).has('MANAGE_WEBHOOKS')) {
        let webhooks = await channel.fetchWebhooks();
        let webhook = webhooks.find(webhook => webhook.name === 'Log');
  
        if (webhook) message.guild.db.log.webhook = { id: webhook.id, token: webhook.token }
        else {
          webhook = await channel.createWebhook('Log', { avatar: 'https://cdn.discordapp.com/avatars/697263650997534812/a3c4a5762bf5f6fc93fabd0fb7881f53.png?size=256' });
          message.guild.db.log.webhook = { id: webhook.id, token: webhook.token }
        }
  
        message.guild.logHook = webhook;
      }

      await sql.updateLog(message.guild.id, message.guild.db.log);
      helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_set', message.guild.db.lang), channel.name), helper.messageType.SUCCESS);
    } catch { resolve(); }
  })
}
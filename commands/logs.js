const config = require('../config.json');
const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['logs', 'log', 'l'],
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  run(client, message, args) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!args[1]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

        switch (args[1]) {
          case 'set': case 's': return resolve(await set(client, message, args));
          case 'enable': case 'e': return resolve(await enable(client, message, args));
          case 'disable': case 'd': return resolve(await disable(client, message, args));
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
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_set', message.guild.db.lang), channel.name), helper.messageType.SUCCESS));
    } catch { resolve(); }
  })
}

function enable(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_enable_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let logTypeValues = Object.values(helper.logType);
      let find = logTypeValues.includes(args[2].toLowerCase());

      if (!find) {
        let values = '';

        for (let i = 0; i < logTypeValues.length; i++) values += ` \`\`${logTypeValues[i]}\`\``;
        return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_notfound', message.guild.db.lang), args[2], values), helper.messageType.ERROR));
      }

      if (message.guild.db.log.enabledModules.includes(args[2].toLowerCase())) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_alreadyenabled', message.guild.db.lang), args[2]), helper.messageType.ERROR));

      message.guild.db.log.enabledModules.push(args[2].toLowerCase());
      await sql.updateLog(message.guild.id, message.guild.db.log);
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_enabled', message.guild.db.lang), args[2]), helper.messageType.SUCCESS));
    } catch (err) { console.log(err); resolve(); }
  })
}

function disable(client, message, args) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!args[2]) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_disable_usage', message.guild.db.lang), message.guild.db.prefix, args[0]), helper.messageType.USAGE));

      let logTypeValues = Object.values(helper.logType);
      let find = logTypeValues.includes(args[2].toLowerCase());
      
      if (!find) {
        let values = '';

        for (let i = 0; i < logTypeValues.length; i++) values += ` \`\`${logTypeValues[i]}\`\``;
        return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_notfound', message.guild.db.lang), args[2], values), helper.messageType.ERROR));
      }

      if (!message.guild.db.log.enabledModules.includes(args[2].toLowerCase())) return resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_alreadydisabled', message.guild.db.lang), args[2]), helper.messageType.ERROR));

      message.guild.db.log.enabledModules.splice(logTypeValues.indexOf(args[2].toLowerCase()), 1);
      await sql.updateLog(message.guild.id, message.guild.db.log);
      resolve(await helper.sendMessage(message.channel, util.format(helper.translatePhrase('logs_disabled', message.guild.db.lang), args[2]), helper.messageType.SUCCESS));
    } catch { resolve(); }
  })
}
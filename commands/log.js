const helper = require('../helper.js');
const sql = require('../sql.js');
const util = require('util');

module.exports = {
  aliases: ['log', 'l'],
  usage: '%s%s ``<(s)et/(e)nable/(d)isable>``',
  channel: ['text'],
  guildPermissions: ['MANAGE_GUILD'],
  async run(client, message, args) {
    try {
      if (!args[1]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

      switch (args[1]) {
        case 'set': case 's': return set(client, message, args);
        //case 'enable': case 'e': return enable(client, message, args);
        //case 'disable': case 'd': return disable(client, message, args);
        default: return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(this.usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);
      }
    } catch (err) { console.error(err); }
  }
}

async function set(client, message, args) {
  try {
    let usage = '%s%s (s)et ``<channel>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);

    let channel = await helper.resolveChannel(message, args[2], true);
    if (!channel) return;

    if (channel.type !== 'text') return helper.sendMessage(message.channel, util.format(helper.translatePhrase('channel_invalid', message.guild.db.lang), channel.name), helper.messageType.ERROR);

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
    helper.sendMessage(message.channel, util.format(helper.translatePhrase('log_set', message.guild.db.lang), channel.name), helper.messageType.SUCCESS);
  } catch (err) { console.error(err); }
}

async function enable(client, message, args) {
  try {
    let usage = '%s%s (e)nable ``<logType>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);
  } catch (err) { console.error(err); }
}

async function disable(client, message, args) {
  try {
    let usage = '%s%s (d)isable ``<logType>``';
    if (!args[2]) return helper.sendMessage(message.channel, `${helper.translatePhrase('usage', message.guild.db.lang)} ${util.format(usage, message.guild.db.prefix, args[0])}`, helper.messageType.USAGE);
  } catch (err) { console.error(err); }
}
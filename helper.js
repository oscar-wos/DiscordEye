const { MessageEmbed } = require('discord.js');

const messageType = {
  NO_ACCESS: 'type_noaccess',
  USAGE: 'type_usage',
  SUCCESS: 'type_sucess',
  ERROR: 'type_error'
}

const log = {
  MESSAGE_DELETE: 'message_delete',
  MESSAGE_UPDATE: 'message_update'
}

const fs = require('fs');

module.exports.resolveUser = function(client, userId) {
  return new Promise(async (resolve, reject) => {
    userId = userId.replace('!', '');

    if (userId.startsWith('<@')) userId = userId.slice(2, userId.length - 1);
    if (isNaN(Number(userId))) return resolve();

    try {
      resolve(await client.users.fetch(userId));
    } catch (err) { reject(err); }
  })
}

module.exports.translatePhrase = function(phrase, language) {
  const en = require('./translations/en.json');
  var translation = en[phrase];
  
  if (fs.existsSync(`./translations/${language}.json`)) {
    const lang = require(`./translations/${language}.json`);
    if (lang.hasOwnProperty(phrase)) translation = lang[phrase];
  }

  return translation;
}

module.exports.sendMessage = function(channel, message, type) {
  switch (type) {
    case messageType.NO_ACCESS: return messageNoAccess(channel, message);
    case messageType.USAGE: return messageUsage(channel, message);
    case messageType.SUCCESS: return messageSuccess(channel, message);
    case messageType.ERROR: return messageError(channel, message);
  }
}

function messageNoAccess(user, message) {
  let embed = new MessageEmbed();
  embed.setDescription(message);
  embed.setColor('RED');

  try {
    user.send(embed);
  } catch { }
}

function messageUsage(channel, message) {
  if (channel.guild) {
    if (channel.permissionsFor(channel.guild.me).has('EMBED_LINKS')) {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('YELLOW');

      try {
        return channel.send(embed);
      } catch { }
    }
  }

  channel.send(message);
}

function messageSuccess(channel, message) {
  if (channel.guild) {
    if (channel.permissionsFor(channel.guild.me).has('EMBED_LINKS')) {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('GREEN');

      try {
        return channel.send(embed);
      } catch { }
    }
  }

  channel.send(message);
}

function messageError(channel, message) {
  if (channel.guild) {
    if (channel.permissionsFor(channel.guild.me).has('EMBED_LINKS')) {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('RED');

      try {
        return channel.send(embed);
      } catch { }
    }
  }

  channel.send(message);
}

module.exports.messageType = messageType;
const config = require('./config.json');
const { MessageEmbed } = require('discord.js');
const util = require('util');

const messageType = {
  NO_ACCESS: 'type_noaccess',
  USAGE: 'type_usage',
  SUCCESS: 'type_sucess',
  ERROR: 'type_error',
  CODE: 'type_code'
}

const log = {
  MESSAGE_DELETE: 'message_delete',
  MESSAGE_UPDATE: 'message_update'
}

const fs = require('fs');

module.exports.resolveUser = function(message, userId) {
  return new Promise(async (resolve, reject) => {
    userId = userId.replace('!', '');
    if (userId.startsWith('<@')) userId = userId.slice(2, userId.length - 1);

    try {
      resolve(await message.client.users.fetch(userId));
    } catch {
      try {
        resolve(await resolveString(message, userId));
      } catch { resolve(); }
    }
  })
}

function resolveString(message, string) {
  return new Promise(async (resolve, reject) => {
    let findUsers = message.client.users.cache.filter(user => {
      if (user.tag.toLowerCase().includes(string.toLowerCase())) return user;
      if (message.guild && message.guild.member(user).displayName.toLowerCase().includes(string.toLowerCase())) return user;
      return;  
    }).array();

    if (findUsers.length == 0) { sendMessage(message.channel, util.format(translatePhrase('target_notfound', message.guild ? message.guild.db.lang : config.discord.language), string), messageType.ERROR); return resolve(); }
    if (findUsers.length == 1) return resolve(findUsers[0]);

    let reply = '';

    for (let i = 0; i < findUsers.length; i++) {
      let user = findUsers[i];

      if (reply.length > 0) reply += `\n`;
      reply += `[${i}] ${user.tag} (${user.id})`;
    }

    let selection = await sendMessage(message.channel, reply, messageType.CODE);
    
    await message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 10000, errors: ['time'] })
    .then(collection => {
      let collectedMessage = collection.first();
      if (isNaN(collectedMessage.content)) { sendMessage(message.channel, util.format(translatePhrase('target_invalid', message.guild ? message.guild.db.lang : config.discord.language), collectedMessage.content, findUsers.length), messageType.ERROR); resolve(); }
      else {
        let pick = parseInt(collectedMessage.content);
        if (pick < 0 || pick > findUsers.length || pick == 'NaN') { sendMessage(message.channel, util.format(translatePhrase('target_invalid', message.guild ? message.guild.db.lang : config.discord.language), collectedMessage.content, findUsers.length - 1), messageType.ERROR); resolve(); }

        resolve(findUsers[pick]);
      }
    })
    .catch(collection => {
      if (collection.size == 0) sendMessage(message.channel, translatePhrase('target_toolong', message.guild ? message.guild.db.lang : config.discord.language), messageType.ERROR); resolve();
    })

    try {
      await selection.delete({ reason: 'Resolve User by String' });
    } catch { }
  })
}

function translatePhrase(phrase, language) {
  const en = require('./translations/en.json');
  var translation = en[phrase];
  
  if (fs.existsSync(`./translations/${language}.json`)) {
    const lang = require(`./translations/${language}.json`);
    if (lang.hasOwnProperty(phrase)) translation = lang[phrase];
  }

  return translation;
}

function sendMessage(channel, message, type) {
  return new Promise(async (resolve, reject) => {
    switch (type) {
      case messageType.NO_ACCESS: return resolve(await messageNoAccess(channel, message));
      case messageType.USAGE: return resolve(await messageUsage(channel, message));
      case messageType.SUCCESS: return resolve(await messageSuccess(channel, message));
      case messageType.ERROR: return resolve(await messageError(channel, message));
      case messageType.CODE: return resolve(await messageCode(channel, message));
    }
  })
}

function messageNoAccess(user, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('RED');

      resolve(await user.send(embed));
    } catch { resolve(); }
  })
}

function messageUsage(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('YELLOW');

      if (!channel.guild || (channel.guild && channel.permissionsFor(channel.guild.me).has('EMBED_LINKS'))) return resolve(await channel.send(embed));
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageSuccess(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('GREEN');

      if (!channel.guild || (channel.guild && channel.permissionsFor(channel.guild.me).has('EMBED_LINKS'))) return resolve(await channel.send(embed));
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageError(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let embed = new MessageEmbed();
      embed.setDescription(message);
      embed.setColor('RED');

      if (!channel.guild || (channel.guild && channel.permissionsFor(channel.guild.me).has('EMBED_LINKS'))) return resolve(await channel.send(embed));
      resolve(await channel.send(message));
    } catch { resolve(); }
  })
}

function messageCode(channel, message) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await channel.send(message, { code: true }));
    } catch { resolve(); }
  })
}

module.exports.messageType = messageType;
module.exports.sendMessage = sendMessage;
module.exports.translatePhrase = translatePhrase;
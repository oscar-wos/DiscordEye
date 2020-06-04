const config = require('./config.json');
const { MongoClient } = require('mongodb');

var db;

module.exports.connect = function() {
  return new Promise(async (resolve, reject) => {
    try {
      const mongoClient = new MongoClient(config.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      let connection = await mongoClient.connect();
      db = connection.db('discordeye');
      resolve();
    } catch (err) { reject(err); }
  })
}

module.exports.loadGuild = function(client, guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      let dbGuild = await findGuild(guildId);
      let values = { id: guildId, prefix: config.discord.prefix, lang: config.discord.language, managers: config.discord.owners, commands: [], tags: [], log: { channel: null, webhook: { id: null, token: null }, enabledModules: config.discord.log.defaultModules }}

      if (!dbGuild) db.collection('guilds').insertOne(values);
      else values = dbGuild;
      
      client.commands.forEach(async (command) => {
        if (!values.commands.find(com => com.command == command.command)) {
          values.commands.push({ command: command.command, aliases: command.aliases });
          await updateCommands(guildId, values.commands);
        }
      })

      resolve(values);
    } catch (err) { console.log(err); reject(err); }
  })
}

module.exports.updatePrefix = function(guildId, prefix) {
  return new Promise(async (resolve, reject) => {
    try {
      db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { prefix: prefix }}, (err, result) => {
        if (err) reject (err);
        resolve(result);
      })
    } catch (err) { reject(err); }
  })
}

module.exports.updateManagers = function(guildId, managers) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { managers: managers }}, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}

module.exports.updateTags = function(guildId, tags) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { tags: tags }}, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}

module.exports.updateLog = function(guildId, log) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { log: log }}, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}

module.exports.updateCommands = updateCommands;

function findGuild(guildId) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOne({ id: guildId }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
  })
}

function updateCommands(guildId, commands) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { commands: commands }}, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}
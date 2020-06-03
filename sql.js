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
      let values = { id: guildId, prefix: config.discord.prefix, lang: config.discord.language, commands: [] }

      if (!dbGuild) db.collection('guilds').insertOne(values);
      else values = dbGuild;
      
      client.commands.forEach(async (command) => {
        if (!values.commands.find(com => com.command == command.command)) {
          values.commands.push({ command: command.command, aliases: command.aliases });
          await updateGuildCommands(guildId, values.commands);
        }
      })

      resolve(values);
    } catch (err) { reject(err); }
  })
}

module.exports.loadGuildMember = function(guildId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let dbMember = await findMember(guildId, userId);
      let values = { guild: guildId, user: userId, infractions: [] }

      if (!dbMember) db.collection('members').insertOne(values);
      else values = dbMember;
      
      resolve(dbMember);
    } catch (err) { reject(err); }
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

function findGuild(guildId) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOne({ id: guildId }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
  })
}

function findMember(guildId, userId) {
  return new Promise((resolve, reject) => {
    db.collection('members').findOne({ guild: guildId, user: userId }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
  })
}

function updateGuildCommands(guildId, commands) {
  return new Promise((resolve, reject) => {
    db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { commands: commands }}, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}
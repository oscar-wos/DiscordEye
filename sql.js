const config = require('./config.json');
const { MongoClient } = require('mongodb');

module.exports.connect = function connect(client) {
  return new Promise(async (resolve, reject) => {
    try {
      const mongoClient = new MongoClient(config.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      let db = await mongoClient.connect();
      resolve(db.db('discordeye'));
    } catch (err) { reject(err); }
  })
}

module.exports.loadGuild = function loadGuild(client, guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      let dbGuild = await findGuild(client, guildId);
      let values = { id: guildId, prefix: config.discord.prefix, commands: [] }

      if (!dbGuild) client.db.collection('guilds').insertOne(values);
      else values = dbGuild;

      try {
        client.commands.forEach(async (command) => {
          if (!values.commands.find(com => com.command == command.command)) {
            values.commands.push(command);
            let dbCommand = await updateGuildCommands(client, guildId, values.commands);
          }
        })
      } catch (err) { reject(error); }

      resolve(values);
    } catch (err) { reject(error); }
  })
}

function findGuild(client, guildId) {
  return new Promise((resolve, reject) => {
    client.db.collection('guilds').findOne({ id: guildId }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
  })
}

function updateGuildCommands(client, guildId, commands) {
  return new Promise((resolve, reject) => {
    client.db.collection('guilds').findOneAndUpdate({ id: guildId }, { $set: { commands: commands }}, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}
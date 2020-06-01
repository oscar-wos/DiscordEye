const { MongoClient } = require('mongodb');

module.exports.connect = function connect(client, config) {
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
      let values = { id: guildId, prefix: '1' }

      if (!dbGuild) client.db.collection('guilds').insertOne(values);
      else values = dbGuild;

      resolve(values);
    } catch (err) { console.log(err); }
  })
}

function findGuild(client, guildId) {
  return new Promise((resolve, reject) => {
    client.db.collection('guilds').findOne({ id: guildId }, (err, result) => {
      if (err) reject (err);
      resolve(result);
    })
  })
}

const config = require('./config.json');
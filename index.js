
//console.log('1');
/*
(async () => {
  console.log('1');
  
  
  
})
*/



(async () => {
  try {
    const config = require('./config.json');
    const sql = require('./sql.js');
  
    const fs = require('fs');
  
    const Discord = require("discord.js");
    const client = new Discord.Client();
  
    client.commands = new Discord.Collection();
  
    fs.readdir('./events/', (err, files) => {
      if (err) return console.error(err);
      files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
      });
    });
  
    fs.readdir('./commands/', (err, files) => {
      if (err) return console.error(err);
      files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
      });
    });
    
    await sql.connect(client);
    client.login(config.discord.token);
  } catch (err) { console.log(err); }
})();
require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const { prefix } = require('./config.json');
const Discord = require('discord.js');
const { rolesToIdsString } = require('./commands/verify_mes.js');
const path = require('path');
const fetch = require('node-fetch');

// Middleware per concedere l'accesso a tutti gli origini (*)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT] });
client.commands = new Discord.Collection();
client.cronjobs = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  console.log(`enabling ${command.name}`)
  client.commands.set(command.name, command);
}

const cronFiles = fs.readdirSync('./cronjobs').filter(file => file.endsWith('.js'));
for (const file of cronFiles) {
  const job = require(`./cronjobs/mint.js`); // TODO => use ./cronjobs/${file}
  // set a new item in the Collection
  // with the key as the job name and the value as the exported module
  if (job.enabled) {
    console.log(`enabling ${job.description}`)
    client.cronjobs.set(job.name, job);
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('CODING', { type: '🟡 CODING...' });

  client.cronjobs.forEach(job => {
    setInterval(() => job.execute(client), job.interval);
  });
})

client.on('message', message => {
  console.log(message.content)
  if (!message.content.startsWith('/') || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(' ');
  const commandName = args.shift().toLowerCase();

  console.log("Args: ", args, "commandName: ", commandName)
  if (!client.commands.has(commandName)) return message.reply('Command not found!');

  const command = client.commands.get(commandName);

  message.react('🟡')
    .then(() => message.react('✅'))

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
})

client.login(process.env.DISCORD_BOT_TOKEN);

//app.use('/api/discord', require('./api/discord_.js'));
//app.use('/', express.static(path.join(__dirname, '..', 'logged')))

app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});

//app.get('/auth', (req, res) => {
//  res.status(200).sendFile(path.join(__dirname, 'index.html'));
//});


app.use('/', express.static(path.join(__dirname, 'frontend')))
app.use(express.json());

app.post('/getToken', async (req, res) => {
  console.log(req.body)
  if (req.body === undefined) {
    return res.status(400).send({
      status: 'ERROR',
      error: 'NoCodeProvided',
    });
  }
  const tokenResponseData = await fetch('https://discord.com/api/v9/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.body.code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://polynomials',
      scope: 'identify',
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const oauthData = await tokenResponseData.json();
  console.log(oauthData)
  return res.json(oauthData)
});

app.post('/user/addRoles', async (req, res) => {
  console.log(req.body);
  if (req.body === undefined) {
    return res.status(400).send({
      status: 'ERROR',
      error: 'InvalidDataProvided',
    });
  }

  try {
    const guild = await client.guilds.fetch('1196898857997586504');
    const channel = guild.channels.cache.find(ch => ch.id === "1220830846601134151") // Sostituisci 'YOUR_GUILD_ID' con l'ID del tuo server Discord
    const member = await guild.members.fetch(req.body.id);
    if (!member) {
      return res.status(404).send({
        status: 'ERROR',
        error: 'MemberNotFound',
      });
    }

    const rolesToAdd = req.body.roles;
    console.log(rolesToAdd);
    let roledIds= []
    let hasRoles = false;

    for (const roleName of rolesToAdd) {
      const role = guild.roles.cache.find((r) => r.name === roleName);
      if (!role) {
        console.log(`Role ${roleName} not found`);
        continue;
      }

      if (member.roles.cache.has(role.id)) {
        roledIds.push(role.id);
        hasRoles = true
        console.log(`Member already has role ${roleName}`);
        continue;
      }

      roledIds.push(role.id);
      await member.roles.add(role);
      console.log(`Added role ${roleName} to member ${member.user.tag}`);
    }
    console.log(roledIds)
    if (hasRoles === false) {
      channel.send(`Congratulations to <@${member.user.id}> for leveling up! New roles added: <@&${roledIds.join('>, <@&')}>. 🎉`);
    } else {
      channel.send(` <@${member.user.id}>, you already have the roles <@&${roledIds.join('>, <@&')}>.`);
    }

    return res.status(200).send({
      status: 'SUCCESS',
      message: 'Roles added successfully',
    });
  } catch (error) {
    console.error('Error adding roles:', error.message);
    return res.status(500).send({
      status: 'ERROR',
      error: 'InternalServerError',
    });
  }
});



app.get("/p/getMe", async (req, res) => {
  const authString = req.headers.authorization
  const me = await fetch('https://discord.com/api/v9/users/@me', {
    headers: {
      authorization: authString,
    },
  })
  console.log(me)
  if (!me.ok) {
    return false
  }
  const response = await me.json()
  
  // get user's id and username obtained from Discord API
  const { id, username, avatar } = response;
  
  // get coins of user from memory
  const user = { id, username, coins: 1000, avatar}
  res.json(user)
});

app.get('/', (req, res) => {
  console.log("Bot is up and ready!")
})

app.listen(port, () => {
  console.log(`Discord Bot app listening at http://localhost:${port}`)
})

module.exports = app

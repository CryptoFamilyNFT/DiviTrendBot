const fetch = require('node-fetch');
const { openseaAssetUrl } = require('../config.json');
const { contractAddress, ABI721 } = require('../config.json');
const axios = require("axios");
const { Client, Intents, MessageActionRow } = require('discord.js');
const Discord = require('discord.js');
const { ethers } = require("ethers");
const Rewards_ABI = require('../abi/RewardsABI.json');

module.exports = {
	name: "verifynft",
	async execute(message) {
		console.log("Message & args: ", message)
			const embedMsg = new Discord.MessageEmbed()
				.setColor('#FFFF00')
				.setTitle(`Verify your holding @${message.author.username}!`)
				.setURL('https://discord.com/oauth2/authorize?client_id=1215939807046533132&response_type=code&redirect_uri=https%3A%2F%2Fpolynomials.it&scope=identify')
				.addField("Click on the title to verify your holding!", ' ')
				.addField(`Then check 👇 to see your status `, "<#1220830846601134151>")
				.addField("📊 ROLES BASED ON HOLDING 📊", " ")
				.addFields([
					{
						name: "🎗️ CPU",
						value: `0`,
						inline: true
					},
					{
						name: "🏅 RAM",
						value: `1+`,
						inline: true
					},
					{
						name: "🏅 SSD",
						value: `5+`,
						inline: true
					},
					{
						name: "🥉 GPU",
						value: `25+`,
						inline: true
					},
					{
						name: "🥈 MOTHERBOARD",
						value: `50+`,
						inline: true
					},
					{
						name: "🥇 MASTER",
						value: `100+`,
						inline: true
					}
				])
				.setFooter('Powerd by Keepeeto | ETHERCODE' );

			message.channel.send(embedMsg);
	},
};
const axios = require("axios");
const { Client, Intents, MessageActionRow } = require('discord.js');
const Discord = require('discord.js');
const { ethers } = require("ethers");
const Rewards_ABI = require('../abi/RewardsABI.json');

module.exports = {
	name: "terminal",
	async execute(message) {
		console.log("Message & args: ", message)

		try {
			//const embedButton = new Discord.()
			//	.setLabel('BUY NOW!')
			//	.setStyle('PRIMARY')
			//	.setURL(`https://opensea.io/assets/matic/0x034d89CD11a548fc4E4D7C365B0460fa6895De67/${tokenId}`)
			//	.setEmoji('🎨');


			const embedMsg = new Discord.MessageEmbed()
				.setColor('#FFFF00')
				.setTitle(`🟡 TERMINAL: HELPER 🟡`)
				.addFields([
					{
						name: "Give a GM!",
						value: `/gm`,
						inline: false
					},
					{
						name: "Get roles based on the Polynomials you own",
						value: "/verifynft",
						inline: false
					},
                    {
                        name: "Get Polynomials NFT",
                        value: "/pnom {tokenId}",
                        inline: false
                    },
					{
                        name: "Check minted Polynomials",
                        value: "<#1222617204902723664>",
                        inline: false
                    },
					{
                        name: "Check Opensea sales",
                        value: "Soon",
                        inline: false
                    },
					{
                        name: "Check Opensea listings",
                        value: "Soon",
                        inline: false
                    },
				])

			message.channel.send(embedMsg);
		} catch (error) {
            console.log(error)
		}
	},
};
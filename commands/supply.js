const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");

module.exports = {
	name: 'fact',
	async execute(message, args) {
		if (!args.length) {
			return message.channel.send(`You didn't provide a token id, ${message.author}!`);
		}

		if (isNaN(parseInt(args[0]))) {
			return message.channel.send(`Token id must be a number!`);
		}

		const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum");
		const contract = new ethers.Contract(contractAddress, ABI, provider);

		const tokenId = args[0];

		try {
			const owner = await contract.ownerOf(tokenId);
			const ownerAddress = owner.toString();

			const metadataUrl = await contract.tokenURI(tokenId);
			const response = await axios.get(metadataUrl);
			const metadata = response.data;

			const embedMsg = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(metadata.name)
				.setURL(metadata.permalink)
				.addField("Owner: ", ownerAddress)
				.setImage(metadata.image);

			message.channel.send(embedMsg);
		} catch (error) {
			message.channel.send(error.message);
		}
	},
};

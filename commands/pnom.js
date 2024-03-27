const fetch = require('node-fetch');
const { openseaAssetUrl } = require('../config.json');
const { contractAddress, ABI721 } = require('../config.json');
const axios = require("axios");
const { Client, Intents, MessageActionRow } = require('discord.js');
const Discord = require('discord.js');
const { ethers } = require("ethers");
const Rewards_ABI = require('../abi/RewardsABI.json');

module.exports = {
	name: "pnom",
	async execute(message, args) {
		console.log("Message & args: ", message, args)
		if (!args.length) {
			return message.channel.send(`You didn't provide a token id, ${message.author}!`);
		}

		if (isNaN(parseInt(args[0]))) {
			return message.channel.send(`Token id must be a number!`);
		}

		const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.infura.io/v3/7cf51be4210a4e13b5ddab7481b7e5b9");
		const contract = new ethers.Contract('0x034d89CD11a548fc4E4D7C365B0460fa6895De67', ABI721, provider);
		const royalties = new ethers.Contract('0xb4480d2a4900114284727c2b34c02c20f15ba4a9', Rewards_ABI, provider);

		const tokenId = Number(args[0]);
		console.log("tokenId: ", tokenId)

		async function getRoyalties(tokenId) {
			try {
				const bal = await royalties.mymultiPAYOUT([tokenId])
				return bal;
			} catch (error) {
				console.error("Error in getRoyalties:", error);
				return 0;
			}
		}

		async function getImageUrl(tokenId) {
			try {
				const response = await axios.get(`https://ipfs.filebase.io/ipfs/QmeuR1QCcJ2Bwr5NjHQezo8UfBd1BJ4SpPkfKgg8fRj1LG/${tokenId}.json`);
				console.log("Response data:", response.data);

				const json = response.data;
				const image = json.image;
				const fixedImage = image.replace("ipfs://", "https://ipfs.io/ipfs/");
				console.log("fixedImage Image URL:", fixedImage);

				return fixedImage;
			} catch (error) {
				console.error("Error in getImageUrl:", error);
				throw error; // Rilancia l'errore per gestirlo nel chiamante
			}
		}

		try {
			console.log("Init embedd tokenId", tokenId)
			const owner = await contract.ownerOf(tokenId);
			console.log("Owner: ", owner)
			const ownerAddress = owner.toString();

			const imageUrl = await getImageUrl(tokenId);
			console.log("Image URL: ", imageUrl)

			const royalties = await getRoyalties(tokenId);
			console.log("Royalties: ", royalties)

			const isClaimed = royalties === 0

			//const embedButton = new Discord.()
			//	.setLabel('BUY NOW!')
			//	.setStyle('PRIMARY')
			//	.setURL(`https://opensea.io/assets/matic/0x034d89CD11a548fc4E4D7C365B0460fa6895De67/${tokenId}`)
			//	.setEmoji('🎨');


			const embedMsg = new Discord.MessageEmbed()
				.setColor('#FFFF00')
				.setTitle(`Polynomials ${tokenId}`)
				.setURL(imageUrl)
				.addField("Owner: ", ownerAddress)
				.setImage(imageUrl)
				.addFields([
					{
						name: "Royalties claimable",
						value: `${royalties} MATIC`,
						inline: true
					},
					{
						name: "Claimed",
						value: `${isClaimed ? "True" : "False"}`,
						inline: true
					},
					{
						name: "Token ID",
						value: tokenId,
						inline: true
					},
				])
				.setFooter('Powerd by Keepeeto | ETHERCODE' );

			message.channel.send(embedMsg);
		} catch (error) {
			console.log(error)
			const embedMsgError = new Discord.MessageEmbed()
				.setColor('#FFFF00')
				.setTitle(`Polynomials ${tokenId}`)
				.addField("⛏️ NOT MINTED YET")
				.addFields([
					{
						name: "🧉 Price if you hold 0 PNOM",
						value: `6 MATIC`,
						inline: true
					},
					{
						name: "🔥 Price if you hold 1 to 10 PNOM",
						value: `4 MATIC`,
						inline: true
					},
					{
						name: "💎 Price if you hold >10 PNOM",
						value: `3 MATIC`,
						inline: true
					},
				])
				.setFooter('Powerd by Keepeeto | ETHERCODE' );
			message.channel.send(embedMsgError);
		}
	},
};
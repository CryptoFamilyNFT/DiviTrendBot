const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI721 } = require('../config.json');
const axios = require("axios");
const { Client, Intents } = require('discord.js');

module.exports = {
	name: 'fact',
	async execute(message, args) {
		if (!args.length) {
			return message.channel.send(`You didn't provide a token id, ${message.author}!`);
		}

        console.log("Message & args: ", message, args)

		if (isNaN(parseInt(args[0]))) {
			return message.channel.send(`Token id must be a number!`);
		}

        const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
        const contract = new ethers.Contract('0x219f446A9f23A7f22F84BbeAd6AE5F1d30FDA13A', ABI721, provider);

		const tokenId = Number(args[0]);
        console.log(tokenId)

        async function getImageUrl(tokenId) {
            try {
                const uri = await contract.baseURI(tokenId);
                console.log("Base URI:", uri);
                
                const response = await axios.get(uri);
                console.log("Response data:", response.data);
        
                const json = response.data;
                const image = 'https://ipfs.filebase.io/ipfs/' + json.image.slice(7);
                console.log("Image URL:", image);
        
                return image;
            } catch (error) {
                console.error("Error in getImageUrl:", error);
                throw error; // Rilancia l'errore per gestirlo nel chiamante
            }
        }

		try {
            console.log("tokenId", tokenId)
		} catch (error) {
            console.log(error)
		}
	},
};

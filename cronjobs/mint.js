const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios")

var listingCache = [];
var lastTimestamp = null;

module.exports = {
    name: 'mint',
    description: 'mint bot',
    interval: 30000,
    enabled: process.env.DISCORD_MINT_CHANNEL_ID != null,
    async execute(client) {
        if (lastTimestamp == null) {
            lastTimestamp = Math.floor(Date.now() / 1000) - 120;
        } else {
            lastTimestamp -= 30;
        }
        let newTimestamp = Math.floor(Date.now() / 1000) - 30;
        let newEvents = true;

        const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc"); // Set provider
        const contract = new ethers.Contract(contractAddress, ABI, provider);

        do {
            try {
                const events = await contract.queryFilter("NftMinted");
                if (events.length === 0) {
                    newEvents = false;
                    continue;
                }

                events.forEach(async (event) => {
                    if (listingCache.includes(event.transactionHash)) {
                        newEvents = false;
                        return;
                    } else {
                        listingCache.push(event.transactionHash);
                        if (listingCache.length > 200) listingCache.shift();
                    }
                    const account = event.args[0];
                    const data = event.args[1];
                    console.log("data: ", data)

                    async function getImageUrl(tokenId) {
                        const uri = contract.tokenURI(tokenId)
                        const response = await axios.get(uri);
                        const json = response.data;
                        return json.image;
                    }

                    data.forEach(async (tokenId) => {
                        const imageUrl = await getImageUrl(tokenId);

                        const embedMsg = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("Divitrend Factories #", tokenId)
                            .setURL(imageUrl)
                            .setDescription(`has just been minted $FACT #${tokenId}`)
                            .setThumbnail("https://media.istockphoto.com/id/1419410282/it/foto/foresta-silenziosa-in-primavera-con-bellissimi-raggi-solari-luminosi.jpg?s=1024x1024&w=is&k=20&c=862RzuFSftSKPGBT1WtN6NKBaJNZkBbcNuNG7uKA9VQ=")
                            .addField("FROM", `[${account}]`, true)
                            .addField("TX HASH:", `[${event.transactionHash}]`, true)

                        const channel = await client.channels.fetch(process.env.DISCORD_LISTING_CHANNEL_ID);
                        channel.send(embedMsg);
                    });
                });
            } catch (error) {
                console.error(error);
                return;
            }
        } while (newEvents)

        lastTimestamp = newTimestamp;
    }
};

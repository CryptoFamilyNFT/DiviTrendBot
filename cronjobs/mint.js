const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");

module.exports = {
    name: 'mint',
    description: 'mint bot',
    interval: 10000, // Puoi rimuovere questo campo se non stai più utilizzando l'intervallo
    enabled: process.env.DISCORD_MINT_CHANNEL_ID != null,
    async execute(client) {
        const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum");
        const contract = new ethers.Contract(contractAddress, ABI, provider);
        console.log("Provider and contract initialized");

        async function getImageUrl(tokenId) {
            const uri = await contract.baseURI().then((uri) => { return `https://ipfs.filebase.io/ipfs/Qmcs2hj3FacNR95Mc4BrzZJbJWqJ7ZfyzvJkrAfov5BL9p/${tokenId}` })
            console.log("URI:", uri);
            const response = await axios.get(uri);
            const json = response.data;
            const image = 'https://ipfs.filebase.io/ipfs/' + json.image.slice(7)
            return image;
        }

        // Sottoscrivi l'evento NftMinted
        contract.on("NftMinted", async (account, tokenIds, event) => {
            console.log("New event - Account:", account);
            console.log("New event - Token IDs:", tokenIds);

            tokenIds.forEach(async (tokenId) => {
                try {
                    const imageUrl = await getImageUrl(tokenId);
                    console.log("New event - Image URL:", imageUrl);

                    const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle("Divitrend Factories #" + tokenId)
                        .setURL(imageUrl)
                        .setDescription(`[${account.slice(0,5)}...] has just minted: $FACT #${tokenId}`)
                        .setThumbnail(imageUrl)
                        .addField("FROM", `[${account}]`, true)
                        .addField("TX HASH:", `[${event.transactionHash}]`, true);

                    const channel = await client.channels.fetch(process.env.DISCORD_LISTING_CHANNEL_ID);
                    channel.send(embedMsg);
                } catch (error) {
                    console.error(error);
                }
            });
        });
    }
};

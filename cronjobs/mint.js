const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");

async function getImageUrl(tokenId) {
    const uri = `https://ipfs.filebase.io/ipfs/Qmc5bNfd1kiKuetdXGUsvSbX1aPZPZgYrSTjY6SPPHAu5Q/${tokenId}`
    console.log("URI:", uri);
    const response = await axios.get(uri);
    const json = response.data;
    const image = 'https://ipfs.filebase.io/ipfs/' + json.image.slice(7)
    return image;
}


module.exports = {
    name: 'mint',
    description: 'mint bot',
    enabled: process.env.DISCORD_MINT_CHANNEL_ID != null,
    async execute(client) {
        const provider = new ethers.providers.JsonRpcProvider("https://arbitrum-sepolia.blockpi.network/v1/rpc/public");
        const contract = new ethers.Contract('0xa0991a14aa74aDF7C25b1409f49D2981132a46B8', ABI, provider);
        console.log("Provider and contract initialized");

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

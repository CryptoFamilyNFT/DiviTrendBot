const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");


module.exports = {
    name: 'mint',
    description: 'mint bot',
    interval: 10000,
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

        // Funzione per gestire l'evento NftMinted
        async function handleMintedEvent(event) {
            const account = event.args[0];
            const tokenIds = event.args[1];
            const transactionHash = event.transactionHash;

            tokenIds.forEach(async (tokenId) => {
                try {
                    const imageUrl = await getImageUrl(tokenId);
                    console.log("New event - Image URL:", imageUrl);

                    const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle("Divitrend Factories #" + tokenId)
                        .setURL(imageUrl)
                        .setDescription(`[${account.slice(0,5)}...] has just minted: $FACT #${tokenId}`)
                        .setThumbnail("https://media.istockphoto.com/id/1419410282/it/foto/foresta-silenziosa-in-primavera-con-bellissimi-raggi-solari-luminosi.jpg?s=1024x1024&w=is&k=20&c=862RzuFSftSKPGBT1WtN6NKBaJNZkBbcNuNG7uKA9VQ=")
                        .addField("FROM", `[${account}]`, true)
                        .addField("TX HASH:", `[${transactionHash}]`, true);

                    const channel = await client.channels.fetch(process.env.DISCORD_LISTING_CHANNEL_ID);
                    channel.send(embedMsg);
                } catch (error) {
                    console.error(error);
                }
            });
        }

        // Ottieni l'ultimo blocco corrente
        const latestBlock = await provider.getBlockNumber();
        console.log("Latest block:", latestBlock);

        // Ottieni l'evento NftMinted per l'ultimo blocco corrente
        const filter = {
            address: contract.address,
            topics: [ethers.utils.id("NftMinted(uint256,uint256)")], // Event signature
            fromBlock: latestBlock - 50,
            toBlock: latestBlock
        };

        const logs = await provider.getLogs(filter);
        logs.forEach(handleMintedEvent);
    }
};

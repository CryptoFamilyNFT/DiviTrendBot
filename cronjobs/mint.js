const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");

var lastTransactionHash = null;

module.exports = {
    name: 'mint',
    description: 'mint bot',
    enabled: process.env.DISCORD_MINT_CHANNEL_ID != null,
    async execute(client) {
        const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
        const contract = new ethers.Contract(contractAddress, ABI, provider);
        console.log("Provider and contract initialized");

        async function getImageUrl(tokenId) {
            const uri = await contract.baseURI().then((uri) => {return `https://ipfs.filebase.io/ipfs/Qmcs2hj3FacNR95Mc4BrzZJbJWqJ7ZfyzvJkrAfov5BL9p/${tokenId}`})
            console.log("URI:", uri);
            const response = await axios.get(uri);
            const json = response.data;
            const image = 'https://ipfs.filebase.io/ipfs/' + json.image.slice(7)
            return image;
        }

        // Ottieni l'ultimo blocco
        const latestBlock =  await provider.getBlockNumber();
        console.log("Latest block:", latestBlock);

        // Ottieni gli eventi filtrati per NftMinted
        const events = await contract.queryFilter("NftMinted", latestBlock - 100, latestBlock);
        console.log("Events:", events);
        
        // Elabora gli eventi filtrati
        events.forEach(async (event) => {
            const account = event.args[0];
            const tokenIds = event.args[1]; // Modifica per gestire un array di tokenId
            console.log("Account:", account);
            console.log("Token IDs:", tokenIds);

            tokenIds.forEach(async (tokenId) => { // Itera su ogni tokenId
                try {
                    // Qui puoi eseguire la tua logica per recuperare l'URL dell'immagine e inviare il messaggio su Discord
                    const imageUrl = await getImageUrl(tokenId);
                    console.log("Image URL:", imageUrl);

                    const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle("Divitrend Factories #" + tokenId)
                        .setURL(imageUrl)
                        .setDescription(`has just been minted $FACT #${tokenId}`)
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

        // Aggiungi contract.on per catturare gli eventi futuri solo se gli eventi filtrati non si aggiornano automaticamente all'ultimo blocco
        if (!provider._isProvider) {
            contract.on("NftMinted", async (account, tokenIds, event) => { // Modifica per gestire un array di tokenId
                const transactionHash = event.transactionHash;

                if (lastTransactionHash === transactionHash) {
                    // Questo evento è già stato gestito in precedenza
                    return;
                }

                // Memorizza il nuovo transactionHash
                lastTransactionHash = transactionHash;
                console.log("New event - Account:", account);
                console.log("New event - Token IDs:", tokenIds);

                tokenIds.forEach(async (tokenId) => { // Itera su ogni tokenId
                    try {
                        // Qui puoi eseguire la tua logica per recuperare l'URL dell'immagine e inviare il messaggio su Discord
                        const imageUrl = await getImageUrl(tokenId);
                        console.log("New event - Image URL:", imageUrl);

                        const embedMsg = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("Divitrend Factories #" + tokenId)
                            .setURL(imageUrl)
                            .setDescription(`has just been minted $FACT #${tokenId}`)
                            .setThumbnail("https://media.istockphoto.com/id/1419410282/it/foto/foresta-silenziosa-in-primavera-con-bellissimi-raggi-solari-luminosi.jpg?s=1024x1024&w=is&k=20&c=862RzuFSftSKPGBT1WtN6NKBaJNZkBbcNuNG7uKA9VQ=")
                            .addField("FROM", `[${account}]`, true)
                            .addField("TX HASH:", `[${transactionHash}]`, true);

                        const channel = await client.channels.fetch(process.env.DISCORD_LISTING_CHANNEL_ID);
                        channel.send(embedMsg);
                    } catch (error) {
                        console.error(error);
                    }
                });
            });
        }
    }
};

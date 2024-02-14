const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");

let blocksWithoutEvents = 0;

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
                        .setThumbnail(imageUrl)
                        .addField("FROM", `[${account}]`, true)
                        .addField("TX HASH:", `[${transactionHash}]`, true);

                    const channel = await client.channels.fetch(process.env.DISCORD_LISTING_CHANNEL_ID);
                    channel.send(embedMsg);
                } catch (error) {
                    console.error(error);
                }
            });
        }

        // Definisci la funzione per pulire la memoria
        function cleanMemory() {
            console.log("Cleaning JavaScript memory...");
        }

        // Definisci la funzione per eseguire la ricerca di eventi
        async function searchForEvents() {
            const latestBlock = await provider.getBlockNumber();
            console.log("Latest block:", latestBlock);

            const filter = {
                address: contract.address,
                topics: [ethers.utils.id("NftMinted(uint256,uint256)")], // Event signature
                fromBlock: latestBlock - 50,
                toBlock: latestBlock
            };

            const logs = await provider.getLogs(filter);
            if (logs.length === 0) {
                blocksWithoutEvents++; // Incrementa il contatore se non vengono trovati eventi
                if (blocksWithoutEvents >= 3) {
                    cleanMemory(); // Pulisci la memoria dopo 3 blocchi senza eventi
                    blocksWithoutEvents = 0; // Reimposta il contatore
                }
            } else {
                blocksWithoutEvents = 0; // Reimposta il contatore se vengono trovati eventi
                logs.forEach(handleMintedEvent);
            }
        }

        // Esegui la ricerca di eventi ogni 10 secondi
        setInterval(searchForEvents, 10000);
    }
};

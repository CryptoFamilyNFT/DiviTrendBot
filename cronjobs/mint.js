const { ethers } = require("ethers");
const Discord = require('discord.js');
const { contractAddress, ABI } = require('../config.json');
const axios = require("axios");

module.exports = {
    name: 'mint',
    description: 'mint bot',
    interval: 30000, // Esegui ogni 30 secondi
    enabled: process.env.DISCORD_MINT_CHANNEL_ID != null,
    once: false, // Ascolta l'evento più volte

    async execute(client) {
        const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum");
        const contract = new ethers.Contract('0x35029f03602454a6149b353dd8d227c4f2d99b7c', ABI, provider);
        console.log("Provider and contract initialized");

        // Funzione per gestire l'evento NftMinted
        async function handleMintedEvent(event) {
            const account = event.args[0];
            const tokenIds = event.args[1];
            console.log("TOKEND IDS = ", tokenIds)
            const transactionHash = event.transactionHash;
            console.log(event)

            tokenIds.forEach(async (tokenId) => {
                try {
                    const image = 'https://ipfs.filebase.io/ipfs/' + 'QmPejW5kfFj67JccPCpXcazyehhxNgrg2h1WR6burL9UDj/' + tokenId + '.png'
                    console.log("New event - Image URL:", image);

                    const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle("Divitrend Factories #" + tokenId)
                        .setURL(image)
                        .setDescription(`[${account.slice(0, 5)}...] has just minted: $FACT #${tokenId}`)
                        .setThumbnail(image)
                        .addField("FROM", `[${account}]`, true)
                        .addField("TX HASH:", `[${transactionHash}]`, true);

                    const channel = await client.channels.fetch(process.env.DISCORD_LISTING_CHANNEL_ID);
                    channel.send(embedMsg);
                } catch (error) {
                    console.error(error);
                }
            });
        }

        // Funzione per controllare gli eventi dei blocchi
        async function checkForEvents() {
            try {
                const latestBlock = await provider.getBlockNumber();
                console.log("Latest block:", latestBlock);

                const fromBlock = latestBlock - 150; // Utilizza l'ultimo blocco controllato
                const toBlock = latestBlock;

                console.log("Checking for events from block", fromBlock, "to block", toBlock); // Log per i blocchi che stiamo controllando

                // Ottieni tutti gli eventi nei blocchi specificati
                contract.on("NftMinted", (account, tokenIds, event) => {
                    console.log("New event - Token IDs:", tokenIds);
                    handleMintedEvent({ args: [account, tokenIds], transactionHash: event.transactionHash });
                });

            } catch (error) {
                console.error("An error occurred while fetching events:", error);
            }
        }

        // Esegui la funzione checkForEvents quando il modulo viene inizializzato
        checkForEvents();
    }
};

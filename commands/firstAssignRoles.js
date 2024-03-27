const fetch = require('node-fetch');
const { openseaAssetUrl } = require('../config.json');
const { contractAddress, ABI721 } = require('../config.json');
const axios = require("axios");
const { Client, Intents, MessageActionRow } = require('discord.js');
const Discord = require('discord.js');
const { ethers } = require("ethers");
const Rewards_ABI = require('../abi/RewardsABI.json');

/**
 * When the user verifies through the front-end, give the roles.
 * @param user The discord user.
 * @param userId The user's discord id.
 * @param walletAddress The user's account.
 * @param roleIds The role ids user will be assigned.
 */
module.exports = {
    name: "firstAssignRoles",
    async execute(userId, walletAddress, roleIds) {
        try {
            let roleAddTags = [];
            const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT] });
            const guild = await client.guilds.fetch('1196898857997586504')
            let member = await guild?.members.fetch(userId);


            for (let i = 0; i < roleIds.length; i++) {
                await member?.roles.add(roleIds[i]);
                roleAddTags.push(`<@&${roleIds[i]}>`);
            }

            const channel = (await client.channels.fetch('1220830846601134151'));

            const embed = Discord.MessageEmbed()
                .setColor(0x4a86d4)
                .setTitle("Member Verified")
                .setAuthor({
                    name: "Polynomials Terminal",
                    iconURL: "https://kaijuofcronos.com/img/FINAL_KAIJU_TALISMAN_small.png",
                    url: "https://kaijuofcronos.com/",
                })
                .addFields({ name: "Name", value: member.toString(), inline: true }, {
                    name: "Account",
                    value: `[${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}](https://polygonscan.com/address/${walletAddress})`,
                    inline: true,
                }, { name: "(+) Add Roles", value: `${roleAddTags}` })
                .setTimestamp()
                .setFooter({
                    text: "Polynomials Terminal",
                });
                await channel?.send({ embeds: [embed] });
                return true;
        }
        catch (error) {
            console.error("Failed to give role(s) or the user is not on our server.");
            console.error(error);
            return false;
        }
    }
}
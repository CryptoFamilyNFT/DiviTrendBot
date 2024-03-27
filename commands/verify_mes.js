
const fetch = require('node-fetch');
const { openseaAssetUrl } = require('../config.json');
const { contractAddress, ABI721 } = require('../config.json');
const axios = require("axios");
const { Client, Intents, MessageActionRow } = require('discord.js');
const Discord = require('discord.js');
const { ethers } = require("ethers");
const Rewards_ABI = require('../abi/RewardsABI.json');

module.exports = {
	name: "verify_HOLDING",
	async execute(tokenIds) {
		console.log("Message & args: ", message, args)

        const Roles = [
            "1196903365897093232",
            "1198034238113579078",
            "1198035551366959215",
            "1198036651025367040",
            "1198036882093785118",
            "1198599157133365340",
        ];

        const rangeRolesBasedOnTokenId = (tokenId) => {
            if (tokenId === 0) {
                return [Roles[0]];
            } else if (tokenId >= 1 && tokenId <= 5) {
                return [Roles[0], Roles[1]];
            } else if (tokenId >= 6 && tokenId <= 25) {
                return [Roles[0], Roles[1], Roles[2]];
            } else if (tokenId >= 26 && tokenId <= 50) {
                return [Roles[0], Roles[1], Roles[2], Roles[3]];
            } else if (tokenId >= 51 && tokenId <= 100) {
                return [Roles[0], Roles[1], Roles[2], Roles[3], Roles[4]];
            } else if (tokenId >= 101) {
                return [Roles[0], Roles[1], Roles[2], Roles[3], Roles[4], Roles[5]];
            } else {
                return ["No Role"];
            }
        }

        const roles_ = rangeRolesBasedOnTokenId(tokenIds);
        return roles_
	},
};
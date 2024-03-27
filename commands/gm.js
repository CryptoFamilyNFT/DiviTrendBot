const Discord = require('discord.js');

module.exports = {
    name: 'gm',
    async execute(message, args) {
        console.log("Executing gm command")
        const randomText = ["RISE AND SHINE!", "JEEE EEEM!!", "GM FAMS!"];
        const randomIndex = Math.floor(Math.random() * randomText.length);
        const randomGreeting = randomText[randomIndex];

        const randomImage = ["https://i.ibb.co/M2C6knY/1.png", "https://i.ibb.co/Dkkr4r1/2.png", "https://i.ibb.co/N91MdMq/3.png"]
        const randomIndexImg = Math.floor(Math.random() * randomText.length);
        const randomImaging = randomImage[randomIndexImg];

        const file = new Discord.MessageAttachment(randomImage);

        const exampleEmbed = new Discord.MessageEmbed()
            .setTitle(randomGreeting)
            .setImage(randomImaging)

        message.channel.send(exampleEmbed);
    },
};

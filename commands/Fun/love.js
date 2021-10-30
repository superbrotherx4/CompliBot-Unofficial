const prefix = process.env.PREFIX
const Discord = require('discord.js')

const colors = require('../../resources/colors')

const { string } = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'love',
  description: string('command.description.love'),
  category: 'Fun',
  guildOnly: true,
  uses: string('command.use.anyone'),
  syntax: `${prefix}love <@user1> <@user2>`,
  example: `${prefix}love @Juknum @TheRolf\n${prefix}love Juknum TheRolf`,
  /** @param {Discord.Message} message */
  async execute(_client, message, args) {
    if (args.length !== 2) return warnUser(message, string('command.args.none_given'))

    const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.username === args[0] || m.displayName === args[0])
    const member2 = (message.mentions.members.size == 2 ? message.mentions.members.values().next().next().value : message.mentions.members.first()) || message.guild.members.cache.find(m => m.username === args[1] || m.displayName === args[1])

    if (!member || !member2) return warnUser(message, string('command.love.two_users'))

    const love_amount = Math.round(Math.random() * 100)

    const embed = new Discord.MessageEmbed()
      .setTitle(`${member.displayName} :heart: ${member2.displayName}`)
      .setDescription(love_amount + '%')
      .setColor(colors.BLUE)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}

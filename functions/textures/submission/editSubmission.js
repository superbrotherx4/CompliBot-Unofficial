const settings = require('../../../resources/settings.json')

const { Permissions } = require('discord.js');
const { magnify } = require('../../../functions/textures/magnify')
const { palette } = require('../../../functions/textures/palette')
const { tile } = require('../tile')
const compareFunction = require('../compare')

const CANVAS_FUNCTION_PATH = '../../../functions/textures/canvas'
function nocache(module) { require('fs').watchFile(require('path').resolve(module), () => { delete require.cache[require.resolve(module)] }) }
nocache(CANVAS_FUNCTION_PATH)

/**
 * Edit the embed of the submission
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordReaction} reaction
 * @param {DiscordUser} user
 */
async function editSubmission(client, reaction, user) {
  const message = await reaction.message.fetch()
  const member = await message.guild.members.cache.get(user.id)
  if (member.bot === true) return
  if (message.embeds.length == 0 || message.embeds[0].fields.length == 0) return

  const authorID = await message.embeds[0].fields[0].value.split('\n').map(el => el.replace('<@', '').replace('!', '').replace('>', ''))[0]

  if (reaction.emoji.id === settings.emojis.see_more || reaction.emoji.id === settings.emojis.see_more_old) {

    reaction.remove().catch(err => { if (process.DEBUG) console.error(err) })

    let EMOJIS = [settings.emojis.see_less, settings.emojis.delete, settings.emojis.instapass, settings.emojis.invalid, settings.emojis.magnify, settings.emojis.palette, settings.emojis.tile, settings.emojis.compare]

    // if the message does not have up/down vote react, remove INSTAPASS & INVALID from the emojis list (already instapassed or votes flushed)
    if (!message.embeds[0].fields[1].value.includes(settings.emojis.pending) && !message.embeds[0].fields[1].value.includes('⏳'))
      EMOJIS = EMOJIS.filter(emoji => emoji !== settings.emojis.instapass && emoji !== settings.emojis.invalid && emoji !== settings.emojis.delete)

    // if the message is in #council-vote #texture-revote, remove delete reaction (avoid missclick)
    if (message.channel.id === settings.channels.submit_council.c32 || message.channel.id === settings.channels.submit_revote.c32 || message.channel.id === settings.channels.submit_council.c32 || message.channel.id === settings.channels.submit_revote.c32)
      EMOJIS = EMOJIS.filter(emoji => emoji !== settings.emojis.delete)

    // add reacts
    for (let i = 0; EMOJIS[i]; i++) await message.react(EMOJIS[i])

    // make the filter
    const filter = (REACT, USER) => {
      return EMOJIS.includes(REACT.emoji.id) && USER.id === user.id
    }

    // await reaction from the user
    message.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] })
      .then(async collected => {
        const REACTION = collected.first()
        const USER_ID = [...collected.first().users.cache.values()].filter(user => user.bot === false).map(user => user.id)[0]

        if (REACTION.emoji.id === settings.emojis.palette) palette(message, message.embeds[0].image.url, user.id)
        else if (REACTION.emoji.id === settings.emojis.magnify) magnify(message, message.embeds[0].image.url, user.id)
        else if (REACTION.emoji.id === settings.emojis.tile) tile(message, message.embeds[0].image.url, 'grid', user.id)

        /**
         * TODO: find why you can't have 2 textures of the same resolution in the drawer.urls (the texture isn't processed??)
         */
        else if (REACTION.emoji.id === settings.emojis.compare) {
          /** @type {MessageEmbed} */
          const embed = message.embeds[0]

          const currentSubmissionUrl = embed.image.url
          const textureTitle = embed.title
          const textureId = textureTitle.substring(textureTitle.indexOf('#') + 1, textureTitle.indexOf(']')).trim()

          /** @type {import('../compare').CompareOption} */
          const options = {
            id: textureId,
            user: user,
            images: [currentSubmissionUrl]
          }

          await compareFunction(options)
        }

        /**
         * TODO: for instapass & flush reacts, check if the user who reacted have the Council role, and not admin perms
         */
        if (REACTION.emoji.id === settings.emojis.instapass && member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
          removeReact(message, [settings.emojis.upvote, settings.emojis.downvote])
          changeStatus(message, `<:instapass:${settings.emojis.instapass}> Instapassed`)
          instapass(client, message)
        }
        if (REACTION.emoji.id === settings.emojis.invalid && member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
          removeReact(message, [settings.emojis.upvote, settings.emojis.downvote])
          changeStatus(message, `<:invalid:${settings.emojis.invalid}> Invalid`)
        }

        // delete message only if the first author of the field 0 is the discord user who reacted, or if the user who react is admin
        if (REACTION.emoji.id === settings.emojis.delete && (USER_ID === authorID || member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))) return await message.delete()

        removeReact(message, EMOJIS)
        await message.react(client.emojis.cache.get(settings.emojis.see_more))

      })
      .catch(async err => {
        if (!message.deleted) {
          removeReact(message, EMOJIS)
          await message.react(client.emojis.cache.get(settings.emojis.see_more))
        }

        console.log(err)
      })
  }

}

async function instapass(client, message) {
  let channelOut
  if (message.channel.id == settings.channels.submit_textures.c32) channelOut = await client.channels.fetch(settings.channels.submit_results.c32) // obtains the channel or returns the one from cache
  else if (message.channel.id == settings.channels.submit_textures.c64) channelOut = await client.channels.fetch(settings.channels.submit_results.c64) // obtains the channel or returns the one from cache

  channelOut.send({
    embeds:
      [message.embeds[0]
        .setColor(settings.colors.green)
        .setDescription(`[Original Post](${message.url})\n${message.embeds[0].description ? message.embeds[0].description : ''}`)
      ]
  })
    .then(async sentMessage => {
      for (const emojiID of [settings.emojis.see_more]) await sentMessage.react(client.emojis.cache.get(emojiID))
    })

  editEmbed(message)
}

async function editEmbed(message) {
  let embed = message.embeds[0]
  // fix the weird bug that also apply changes to the old embed (wtf)
  if (message.channel.id == '841396215211360296') embed.setColor(settings.colors.blue)
  else if (message.channel.id == settings.channels.submit_textures.c32 || message.channel.id == settings.channels.submit_textures.c64)
    embed.setColor(settings.colors.blue)
  else if (message.channel.id == settings.channels.submit_council.c32 || message.channel.id == settings.channels.submit_council.c64)
    embed.setColor(settings.colors.council)
  else if (message.channel.id == settings.channels.submit_revote.c32 || message.channel.id == settings.channels.submit_revote.c64)
    embed.setColor(settings.colors.red)

  if (embed.description !== null) embed.setDescription(message.embeds[0].description.replace(`[Original Post](${message.url})\n`, ''))

  await message.edit({ embeds: [embed] })
}

async function changeStatus(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string
  await message.edit({ embeds: [embed] })
}

async function removeReact(message, emojis) {
  for (let i = 0; emojis[i]; i++) {
    await message.reactions.cache.get(emojis[i]).remove().catch(err => {
      if (process.DEBUG) console.error(`Can't remove emoji: ${emojis[i]}\n${err}`)
    })
  }
}

exports.editSubmission = editSubmission
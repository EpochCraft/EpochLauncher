// Work in progress
const {LoggerUtil} = require('helios-core')

const logger = LoggerUtil.getLogger('DiscordWrapper')

const {Client} = require('discord-rpc-patch')

const Lang = require('./langloader')

let client
let activity

exports.initRPC = function (genSettings, servSettings, initialDetails = Lang.queryJS('discord.waiting')) {
    try {
        client = new Client({transport: 'ipc'})

        activity = {
            details: initialDetails,
            state: Lang.queryJS('discord.state', {shortId: servSettings.shortId}),
            largeImageKey: servSettings.largeImageKey,
            largeImageText: servSettings.largeImageText,
            smallImageKey: genSettings.smallImageKey,
            smallImageText: genSettings.smallImageText,
            startTimestamp: new Date().getTime(),
            instance: false
        }

        client.on('ready', () => {
            logger.info('Discord RPC Connected')
            client.setActivity(activity)
        })

        client.login({clientId: genSettings.clientId}).catch(error => {
            if (error.message.includes('ENOENT')) {
                logger.info('Unable to initialize Discord Rich Presence, no client detected.')
            } else {
                logger.info('Unable to initialize Discord Rich Presence: ' + error.message, error)
            }
        })
    } catch (e) {
        logger.error('Error initializing Discord RPC: ' + e.message, e)
    }
}

exports.updateDetails = function (details) {

    try {
        activity.details = details
        client.setActivity(activity)
    } catch (e) {
        logger.error('Error updating Discord RPC details: ' + e.message, e)
    }
}

exports.shutdownRPC = function () {
    try {
        if (!client) return
        client.clearActivity()
        client.destroy()
        client = null
        activity = null
    } catch (e) {
        logger.error('Error shutting down Discord RPC: ' + e.message, e)
    }
}
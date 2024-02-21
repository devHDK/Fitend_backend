import events from 'events'
import {logger} from '../loaders'
import {IUserPushType} from '../interfaces/user'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const userPushEvent = 'onUserPushEvent'

eventsEmitter.on(userPushEvent, async (options: IUserPushType) => {
  try {
    await firebase.sendUserMessage(options)
  } catch (e) {
    logger.error(`Error on event ${userPushEvent}`, e)
  }
})

function publishUserPushEvent(options: IUserPushType): void {
  eventsEmitter.emit(userPushEvent, options)
}

export {publishUserPushEvent}

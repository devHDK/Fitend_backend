import events from 'events'
import {logger} from '../loaders'
import {IThreadPushType} from '../interfaces/thread'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const threadPushEvent = 'onReservationPushEvent'

eventsEmitter.on(threadPushEvent, async (options: IReservationPushType) => {
  try {
    await firebase.sendReservationMessage(options)
  } catch (e) {
    logger.error(`Error on event ${threadPushEvent}`, e)
  }
})

function publishThreadPushEvent(options: IReservationPushType): void {
  eventsEmitter.emit(threadPushEvent, options)
}

export {publishThreadPushEvent}

import events from 'events'
import {logger} from '../loaders'
import {IThreadPushType} from '../interfaces/thread'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const threadPushEvent = 'onReservationPushEvent'

eventsEmitter.on(threadPushEvent, async (options: IThreadPushType) => {
  try {
    await firebase.sendThreadMessage(options)
  } catch (e) {
    logger.error(`Error on event ${threadPushEvent}`, e)
  }
})

function publishThreadPushEvent(options: IThreadPushType): void {
  eventsEmitter.emit(threadPushEvent, options)
}

export {publishThreadPushEvent}

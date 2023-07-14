import events from 'events'
import {logger} from '../loaders'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const reservationPushEvent = 'onReservationPushEvent'

eventsEmitter.on(reservationPushEvent, async (options: {userId: number; contents: string}) => {
  const {userId, contents} = options
  try {
    await firebase.sendReservationMessage(userId, contents)
  } catch (e) {
    logger.error(`Error on event ${reservationPushEvent}`, e)
  }
})

function publishReservationPushEvent(options: {userId: number; contents: string}): void {
  eventsEmitter.emit(reservationPushEvent, options)
}

export {publishReservationPushEvent}

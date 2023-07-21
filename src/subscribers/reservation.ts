import events from 'events'
import {logger} from '../loaders'
import {IReservationPushType} from '../interfaces/reservation'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const reservationPushEvent = 'onReservationPushEvent'

eventsEmitter.on(reservationPushEvent, async (options: IReservationPushType) => {
  try {
    await firebase.sendReservationMessage(options)
  } catch (e) {
    logger.error(`Error on event ${reservationPushEvent}`, e)
  }
})

function publishReservationPushEvent(options: IReservationPushType): void {
  eventsEmitter.emit(reservationPushEvent, options)
}

export {publishReservationPushEvent}

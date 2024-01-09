import events from 'events'
import {logger} from '../loaders'
import {IMeetingPushType} from '../interfaces/meetings'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const reservationPushEvent = 'onReservationPushEvent'

eventsEmitter.on(reservationPushEvent, async (options: IMeetingPushType) => {
  try {
    await firebase.sendMeetingMessage(options)
  } catch (e) {
    logger.error(`Error on event ${reservationPushEvent}`, e)
  }
})

function publishMeetingPushEvent(options: IMeetingPushType): void {
  eventsEmitter.emit(reservationPushEvent, options)
}

export {publishMeetingPushEvent}

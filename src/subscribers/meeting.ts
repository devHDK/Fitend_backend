import events from 'events'
import {logger} from '../loaders'
import {IMeetingPushType} from '../interfaces/meetings'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const meetingPushEvent = 'onMeetingPushEvent'

eventsEmitter.on(meetingPushEvent, async (options: IMeetingPushType) => {
  try {
    await firebase.sendMeetingMessage(options)
  } catch (e) {
    logger.error(`Error on event ${meetingPushEvent}`, e)
  }
})

function publishMeetingPushEvent(options: IMeetingPushType): void {
  eventsEmitter.emit(meetingPushEvent, options)
}

export {publishMeetingPushEvent}

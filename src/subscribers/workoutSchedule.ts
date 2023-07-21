import events from 'events'
import {logger} from '../loaders'
import {IWorkoutSchedulePushType} from '../interfaces/workoutSchedules'
import firebase = require('../loaders/firebase')

const eventsEmitter = new events.EventEmitter()
const workoutSchedulePushEvent = 'onWorkoutPushEvent'

eventsEmitter.on(workoutSchedulePushEvent, async (options: IWorkoutSchedulePushType) => {
  try {
    await firebase.sendWorkoutScheduleMessage(options)
  } catch (e) {
    logger.error(`Error on event ${workoutSchedulePushEvent}`, e)
  }
})

function publishWorkoutSchedulePushEvent(options: IWorkoutSchedulePushType): void {
  eventsEmitter.emit(workoutSchedulePushEvent, options)
}

export {publishWorkoutSchedulePushEvent}

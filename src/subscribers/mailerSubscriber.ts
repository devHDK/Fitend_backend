import events from 'events'
import {logger} from '../loaders'

const eventsEmitter = new events.EventEmitter()
const sendResetPasswordEvent = 'onSendResetPassword'
const sendTempPasswordEvent = 'onSendTempPassword'

eventsEmitter.on(sendResetPasswordEvent, async (email: string, name: string, url: string) => {
  try {
    // await mailer.sendResetPassword(email, name, url)
  } catch (e) {
    logger.error(`Error on event ${sendResetPasswordEvent}`, e)
  }
})

eventsEmitter.on(sendTempPasswordEvent, async (email: string, name: string, password: string) => {
  try {
    // await mailer.sendTempPassword(email, name, password)
  } catch (e) {
    logger.error(`Error on event ${sendTempPasswordEvent}`, e)
  }
})

function publishSendResetPasswordEvent(email: string, name: string, url: string): void {
  eventsEmitter.emit(sendResetPasswordEvent, email, name, url)
}

function publishSendTempPasswordEvent(email: string, name: string, password: string): void {
  eventsEmitter.emit(sendTempPasswordEvent, email, name, password)
}

export {publishSendResetPasswordEvent, publishSendTempPasswordEvent}

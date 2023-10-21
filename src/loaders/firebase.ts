import admin from 'firebase-admin'
import config from 'config'
import {aws, logger} from './'
import {IReservationPushType} from '../interfaces/reservation'
import {IWorkoutSchedulePushType} from '../interfaces/workoutSchedules'
import {IThreadPushType} from '../interfaces/thread'

const awsSecrets: string = config.get('aws.firebase')

async function init(): Promise<void> {
  const serviceAccount = await aws.getSecretValue(awsSecrets)
  if (!admin.apps.length)
    admin.initializeApp({
      credential: admin.credential.cert({
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
        clientEmail: serviceAccount.client_email,
        projectId: serviceAccount.project_id
      })
    })
  logger.debug('Firebase loaded')
}

const sendPush = async (
  tokens: string[],
  badge: number,
  sound: string,
  payload: admin.messaging.MessagingPayload
): Promise<void> => {
  try {
    const apnsPayload: {aps: {contentAvailable: boolean; badge: number; sound?: string}} = {
      aps: {contentAvailable: true, badge}
    }
    if (sound) apnsPayload.aps.sound = sound
    const result = await admin.messaging().sendMulticast({
      tokens,
      data: payload.data,
      notification: payload.notification,
      android: !payload.data.type.includes('workoutSchedule')
        ? {
            notification: {
              clickAction: 'FLUTTER_NOTIFICATION_CLICK'
            }
          }
        : null,
      apns: {
        headers: {
          messageType: 'background'
        },
        payload: apnsPayload
      }
    })
    logger.info(`[FCM] sendToTopic result : ${JSON.stringify(result)}`)
  } catch (e) {
    throw e
  }
}

const sendToTopic = async (topic: string, payload: admin.messaging.MessagingPayload): Promise<void> => {
  try {
    const result = await admin.messaging().sendToTopic(topic, payload)
    logger.info(`[FCM] sendToTopic result : ${JSON.stringify(result)}`)
  } catch (e) {
    throw e
  }
}

const sendReservationMessage = async (options: IReservationPushType): Promise<void> => {
  const {tokens, type, data, badge, contents} = options
  try {
    const payload = {
      notification: {title: '', body: contents},
      data: {type, ...data}
    }
    await sendPush(tokens, badge, 'default', payload)
  } catch (e) {
    throw e
  }
}

const sendWorkoutScheduleMessage = async (options: IWorkoutSchedulePushType): Promise<void> => {
  const {tokens, type, data, badge} = options
  try {
    const payload = {
      data: {type, ...data}
    }
    await sendPush(tokens, badge, null, payload)
  } catch (e) {
    throw e
  }
}

const sendThreadMessage = async (options: IThreadPushType): Promise<void> => {
  const {tokens, type, data, badge, contents, sound} = options
  try {
    const payload = {
      notification: {title: '', body: contents},
      data: {type, ...data}
    }
    await sendPush(tokens, badge, sound, payload)
  } catch (e) {
    throw e
  }
}

export {init, sendPush, sendToTopic, sendReservationMessage, sendWorkoutScheduleMessage, sendThreadMessage}

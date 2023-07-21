import admin from 'firebase-admin'
import config from 'config'
import {aws, logger} from './'
import {IReservationPushType} from '../interfaces/reservation'
import {IWorkoutSchedulePushType} from '../interfaces/workoutSchedules'

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

const sendPush = async (tokens: string[], badge: number, payload: admin.messaging.MessagingPayload): Promise<void> => {
  try {
    const result = await admin.messaging().sendMulticast({
      tokens,
      data: payload.data,
      notification: payload.notification,
      apns: {
        headers: {
          messageType: 'background'
        },
        payload: {
          aps: {contentAvailable: true, badge, sound: 'default'}
        }
      }
    })
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
    await sendPush(tokens, badge, payload)
  } catch (e) {
    throw e
  }
}

const sendWorkoutScheduleMessage = async (options: IWorkoutSchedulePushType): Promise<void> => {
  const {tokens, type, data, badge, contents} = options
  try {
    const payload = {
      notification: {title: '', body: contents},
      data: {type, ...data}
    }
    await sendPush(tokens, badge, payload)
  } catch (e) {
    throw e
  }
}

export {init, sendPush, sendReservationMessage, sendWorkoutScheduleMessage}

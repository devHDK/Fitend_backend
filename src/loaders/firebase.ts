import admin from 'firebase-admin'
import config from 'config'
import {aws, logger} from './'

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

const sendToTopic = async (topic: string, payload: admin.messaging.MessagingPayload): Promise<void> => {
  try {
    // const result = await admin.messaging().sendToTopic(topic, payload, {priority: 'high', contentAvailable: true})
    const result = await admin.messaging().send({
      token:
        'eHReJFiKWEjVu5_9yYBGIo:APA91bFxeS2Ym6ywTmEtrOw74gvgzijeJvFvEXgeseWSdIKGSQf-0AkBcj6jGW2fPIuQOrX2zxgpRoSWlMZo6ykepUSS8j78Gg1lCb4Wohw-v1IxX8ILpJLYaonuf9Ewt1uRi_Lzo4Td',
      data: payload.data,
      notification: payload.notification,
      apns: {
        headers: {
          messageType: 'background'
          // 'apns-push-type': 'background',
          // 'apns-priority': '5'
        },
        payload: {
          aps: {contentAvailable: true, badge: 3, sound: 'default'}
        }
      }
    })
    logger.info(`[FCM] sendToTopic result : ${JSON.stringify(result)}`)
  } catch (e) {
    throw e
  }
}

const sendReservationMessage = async (userId: number, contents: string, badge?: number): Promise<void> => {
  try {
    const payload = {
      notification: {title: 'test', body: contents},
      data: {type: 'reservation'}
    }
    await sendToTopic(`user_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

export {init, sendToTopic, sendReservationMessage}

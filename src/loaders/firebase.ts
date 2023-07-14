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
    const result = await admin.messaging().sendToTopic(topic, payload)
    logger.info(`[FCM] sendToTopic result : ${JSON.stringify(result)}`)
  } catch (e) {
    throw e
  }
}

const sendReservationMessage = async (userId: number, contents: string): Promise<void> => {
  try {
    const payload = {
      notification: {title: '', body: contents},
      data: {type: 'reservation'}
    }
    await sendToTopic(`user_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

export {init, sendToTopic, sendReservationMessage}

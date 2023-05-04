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

const sendClubMessage = async (
  userId: number,
  userType: 'presenter' | 'student',
  title: string,
  body: string,
  presenterId: number
): Promise<void> => {
  try {
    const payload = {
      notification: {title, body},
      data: {type: 'club', presenterId: presenterId.toString()}
    }
    await sendToTopic(`${userType}_users_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

const sendMatchMessage = async (
  userId: number,
  userType: 'presenter' | 'student',
  title: string,
  body: string,
  presenterId: number
): Promise<void> => {
  try {
    const payload = {
      notification: {title, body},
      data: {type: 'match', presenterId: presenterId.toString()}
    }
    await sendToTopic(`${userType}_users_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

const sendMatchLinkMessage = async (
  userId: number,
  userType: 'presenter' | 'student',
  title: string,
  body: string,
  studentId: number
): Promise<void> => {
  try {
    const payload = {
      notification: {title, body},
      data: {type: 'match', studentId: studentId.toString()}
    }
    await sendToTopic(`${userType}_users_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

const sendScheduleMessage = async (
  userId: number,
  userType: 'presenter' | 'student',
  title: string,
  body: string,
  startTime: string
): Promise<void> => {
  try {
    const payload = {
      notification: {title, body},
      data: {type: 'match', startTime: startTime.toString()}
    }
    await sendToTopic(`${userType}_users_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

const sendTicketMessage = async (
  userId: number,
  userType: 'presenter' | 'student',
  title: string,
  body: string,
  presenterId: number
): Promise<void> => {
  try {
    const payload = {
      notification: {title, body},
      data: {type: 'ticket', studentId: userId.toString(), presenterId: presenterId.toString()}
    }
    await sendToTopic(`${userType}_users_${userId}`, payload)
  } catch (e) {
    throw e
  }
}

export {
  init,
  sendToTopic,
  sendClubMessage,
  sendMatchMessage,
  sendMatchLinkMessage,
  sendScheduleMessage,
  sendTicketMessage
}

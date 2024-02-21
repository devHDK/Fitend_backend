import moment from 'moment'
import * as bootpay from '../libs/bootpay'
import {db} from '../loaders'
import {IPaymentConfirm, IPaymentList} from '../interfaces/payments'
import {Payment, Ticket, Trainer, TrainerDevice, TrainerNotification, User} from '../models'
import {ITicketList} from '../interfaces/tickets'
import {threadSubscriber} from '../subscribers'
import {ITrainerDevice} from '../interfaces/trainerDevice'

async function confirmPayments(options: IPaymentConfirm): Promise<ITicketList> {
  const connection = await db.beginTransaction()
  try {
    const {receiptId, orderId, price, orderName, userId, trainerId, ...data} = options
    const result = await bootpay.getReceipt({receiptId})
    if (price !== result.price || result.status !== 2 || receiptId !== result.receipt_id)
      throw new Error('wrong_payment')

    await bootpay.serverConfirm({receiptId})

    const ticketId = await Ticket.create(
      {
        type: 'fitness',
        serviceSession: 0,
        totalSession: 0,
        sessionPrice: 0,
        coachingPrice: data.month === 1 ? 90000 : data.month === 3 ? 80000 : 70000,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt,
        month: data.month
      },
      connection
    )
    await Ticket.createRelationExercises({userId, trainerIds: [trainerId], ticketId, franchiseId: 1}, connection)
    await Payment.create({ticketId, receiptId, orderId, price, orderName, status: true}, connection)
    const activeTickets = await Ticket.findAllForUser({userId}, connection)

    const user = await User.findOne({id: userId})
    const trainer = await Trainer.findOne({id: trainerId})
    const trainerDevices = await TrainerDevice.findAllWithUserId(trainerId)
    const contents = `${user.nickname}님이 멤버십을 구매했어요 🎉\n${data.month}개월권 ∙ ${moment(
      data.startedAt
    ).format('YYYY.MM.DD')} ~ ${moment(data.expiredAt).format('YYYY.MM.DD')}`
    const info = {
      userId,
      nickname: user.nickname,
      gender: user.gender
    }
    await TrainerNotification.create(
      {
        trainerId,
        type: 'thread',
        contents,
        info: JSON.stringify(info)
      },
      connection
    )

    if (trainerDevices && trainerDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
        type: 'threadCreate',
        sound: 'default',
        badge: trainer.badgeCount + 1,
        contents,
        data: {
          userId: userId.toString(),
          nickname: user.nickname,
          gender: user.gender
        }
      })
    }

    await db.commit(connection)

    return activeTickets
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: {search: string; start: number; perPage: number}): Promise<IPaymentList> {
  try {
    return await Payment.findAll(options)
  } catch (e) {
    throw e
  }
}

async function deletePayment(options: {id: number}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id} = options
    const payment = await Payment.findOneWithTicketId({ticketId: id})

    const result = await bootpay.getReceipt({receiptId: payment.receiptId})
    if (result.status !== 1 || payment.receiptId !== result.receipt_id) throw new Error('wrong_payment_cancel')

    await Ticket.deleteOne(id)
    await bootpay.cancel({receiptId: payment.receiptId})

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {confirmPayments, findAll, deletePayment}

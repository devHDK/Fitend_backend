import * as bootpay from '../libs/bootpay'
import {db} from '../loaders'
import {IPaymentConfirm} from '../interfaces/payments'
import {Payment, Ticket} from '../models'
import {ITicketList} from '../interfaces/tickets'

async function confirmPayments(options: IPaymentConfirm): Promise<ITicketList> {
  const connection = await db.beginTransaction()
  try {
    const {receiptId, orderId, price, orderName, userId, trainerId, ...data} = options
    const result = await bootpay.getReceipt({receiptId})

    if (price !== result.price || !result.status || receiptId !== result.receipt_id) throw new Error('wrong_payment')

    const ticketId = await Ticket.create(
      {
        type: 'fitness',
        serviceSession: 0,
        totalSession: 0,
        sessionPrice: 0,
        coachingPrice: data.month === 1 ? 90000 : data.month === 3 ? 80000 : 70000,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt
      },
      connection
    )
    await Ticket.createRelationExercises({userId, trainerIds: [trainerId], ticketId, franchiseId: 1}, connection)
    await Payment.create({ticketId, receiptId, orderId, price, orderName, status: true}, connection)

    const activeTickets = await Ticket.findAllForUser({userId}, connection)

    await db.commit(connection)

    return activeTickets
  } catch (e) {
    if (connection) await db.rollback(connection)

    throw e
  }
}

export {confirmPayments}

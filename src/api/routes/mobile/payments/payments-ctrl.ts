import {Response} from 'express'
import {PaymentService, TicketService} from '../../../../services'

async function postConfirmPayments(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {receiptId, orderId, price, orderName, startedAt, expiredAt, trainerId, userId, month} = req.options
    const activeTickets = await PaymentService.confirmPayments({
      receiptId,
      orderId,
      price,
      orderName,
      startedAt,
      expiredAt,
      trainerId,
      userId,
      month
    })

    res.status(200).json({data: activeTickets})
  } catch (e) {
    if (e.message === 'wrong_payment') e.status = 405
    next(e)
  }
}

async function deletePayment(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await PaymentService.deletePayment({id})

    res.status(200).json()
  } catch (e) {
    if (e.message === 'wrong_payment_cancel') e.status = 405
    next(e)
  }
}

export {postConfirmPayments, deletePayment}

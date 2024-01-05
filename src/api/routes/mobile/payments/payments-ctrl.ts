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
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'duplicate_record') e.status = 409
    next(e)
  }
}

export {postConfirmPayments}

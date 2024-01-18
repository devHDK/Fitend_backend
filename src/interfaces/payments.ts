export interface IPayment {
  id: number
  ticketId: number
  receiptId: string
  orderId: string
  price: number
  orderName: string
  status: boolean
  createdAt: Date
}

export interface IPaymentDataForTrainer {
  id: number
  ticketId: number
  userNickname: string
  price: number
  orderName: string
  status: boolean
  createdAt: Date
}

export interface IPaymentConfirm {
  receiptId: string
  orderId: string
  price: number
  orderName: string
  startedAt: string
  expiredAt: string
  trainerId: number
  userId: number
  month: number
}

export interface IPaymentCreate {
  ticketId: number
  receiptId: string
  orderId: string
  price: number
  orderName: string
  status: boolean
}

export interface IPaymentUpdate {
  id: number
  ticketId?: number
  receiptId?: string
  orderId?: string
  price?: number
  orderName?: string
  status?: boolean
}

export type IPaymentList = IResponseList<IPaymentDataForTrainer>

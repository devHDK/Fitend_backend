import {ApiRouter} from '../../default'
import * as ctrl from './payments-ctrl'

const confirmPayments = new ApiRouter({
  name: '',
  method: 'post',
  summary: '결제 내역 검증',
  tags: ['Payments'],
  schema: 'requests/mobile/payments/PostConfirmPayments',
  responses: {
    200: {schema: 'responses/mobile/payments/PostConfirmPayments'},
    405: {description: '결제에 실패했습니다.'}
  },
  handler: ctrl.postConfirmPayments
})

const deletePayment = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'delete',
  summary: '결제 내역 삭제',
  tags: ['Payments'],
  responses: {
    200: {description: 'success'},
    405: {description: '결제에 실패했습니다.'}
  },
  handler: ctrl.deletePayment
})

export {confirmPayments, deletePayment}

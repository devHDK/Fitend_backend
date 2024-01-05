import {ApiRouter} from '../../default'
import * as ctrl from './payments-ctrl'

const confirmPayments = new ApiRouter({
  name: '',
  method: 'post',
  summary: '결제 내역 검증',
  tags: ['Payments'],
  schema: 'requests/mobile/payments/PostConfirmPayments',
  responses: {
    // 200: {schema: 'responses/mobile/payments/'}
    200: {description: 'success'}
  },
  handler: ctrl.postConfirmPayments
})

export {confirmPayments}

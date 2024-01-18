import {ApiRouter} from '../../default'
import * as ctrl from './payment-ctrl'

const getPayment = new ApiRouter({
  name: '',
  method: 'get',
  summary: '결제 목록 조회',
  tags: ['Payment'],
  schema: 'requests/web/payment/GetPayment',
  responses: {
    200: {schema: 'responses/web/payment/GetPayment'}
  },
  handler: ctrl.getPayment
})

export {getPayment}

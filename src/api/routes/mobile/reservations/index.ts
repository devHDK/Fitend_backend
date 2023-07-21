import {ApiRouter} from '../../default'
import * as ctrl from './reservations-ctrl'

const getReservations = new ApiRouter({
  name: '',
  method: 'get',
  summary: '예약정보 조회',
  tags: ['Reservation'],
  schema: 'requests/mobile/reservations/GetReservations',
  responses: {
    200: {schema: 'responses/mobile/reservations/GetReservations'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getReservations
})

export {getReservations}

import {ApiRouter} from '../../default'
import * as ctrl from './reservations-ctrl'

const getReservations = new ApiRouter({
  name: '',
  method: 'get',
  summary: '예약 목록',
  tags: ['Reservation'],
  schema: 'requests/admin/reservations/GetReservations',
  responses: {
    200: {schema: 'responses/admin/reservations/GetReservations'}
  },
  handler: ctrl.getReservations
})

export {getReservations}

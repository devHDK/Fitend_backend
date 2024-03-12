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

const getReservationsWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '예약 상세',
  tags: ['Reservation'],
  responses: {
    200: {schema: 'responses/admin/reservations/GetReservationsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getReservationsWithId
})

export {getReservations, getReservationsWithId}

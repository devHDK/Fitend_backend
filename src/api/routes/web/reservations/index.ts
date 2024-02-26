import {ApiRouter} from '../../default'
import * as ctrl from './reservations-ctrl'

const postReservations = new ApiRouter({
  name: '',
  method: 'post',
  summary: '예약 생성',
  tags: ['Reservation'],
  roles: ['master'],
  schema: 'requests/web/reservations/PostReservations',
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed(타 트레이너의 수강권)/expired_ticket'},
    404: {description: '수강권 id 오류'},
    409: {description: 'reservation_duplicate/over_sessions'}
  },
  handler: ctrl.postReservations
})

const getReservations = new ApiRouter({
  name: '',
  method: 'get',
  summary: '예약 목록',
  tags: ['Reservation'],
  roles: ['master'],
  schema: 'requests/web/reservations/GetReservations',
  responses: {
    200: {schema: 'responses/web/reservations/GetReservations'}
  },
  handler: ctrl.getReservations
})

const getReservationsWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '예약 상세',
  tags: ['Reservation'],
  roles: ['master'],
  responses: {
    200: {schema: 'responses/web/reservations/GetReservationsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getReservationsWithId
})

const putReservationsWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '예약 수정',
  tags: ['Reservation'],
  roles: ['master'],
  schema: 'requests/web/reservations/PutReservationsWithId',
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed'}
  },
  handler: ctrl.putReservationsWithId
})

// const deleteReservationsWithId = new ApiRouter({
//   name: ':id',
//   method: 'delete',
//   paths: ['common/IdPath'],
//   summary: '예약 삭제',
//   tags: ['Reservation'],
//   responses: {
//     200: {description: 'success'}
//   },
//   handler: ctrl.deleteReservationsWithId
// })

export {postReservations, getReservations, getReservationsWithId, putReservationsWithId}

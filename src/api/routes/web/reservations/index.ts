import {ApiRouter} from '../../default'
import * as ctrl from './reservations-ctrl'

const postReservations = new ApiRouter({
  name: '',
  method: 'post',
  summary: '예약 생성',
  tags: ['Reservation'],
  schema: 'requests/web/reservations/PostReservations',
  responses: {
    200: {description: 'success'},
    403: {description: '타 트레이너의 수강권'},
    404: {description: '수강권 id 오류'},
    409: {description: '중복된 예약 있음'}
  },
  handler: ctrl.postReservations
})

// const getReservations = new ApiRouter({
//   name: '',
//   method: 'get',
//   summary: '예약 목록',
//   tags: ['Reservation'],
//   schema: 'requests/web/reservations/GetReservations',
//   responses: {
//     200: {schema: 'responses/web/reservations/GetReservations'}
//   },
//   handler: ctrl.getReservations
// })

// const getReservationsWithId = new ApiRouter({
//   name: ':id',
//   method: 'get',
//   paths: ['common/IdPath'],
//   summary: '예약 상세',
//   tags: ['Reservation'],
//   responses: {
//     200: {schema: 'responses/web/reservations/GetReservationsWithId'},
//     404: {description: 'not_found'}
//   },
//   handler: ctrl.getReservationsWithId
// })
//
// const putReservationsWithId = new ApiRouter({
//   name: ':id',
//   method: 'put',
//   paths: ['common/IdPath'],
//   summary: '예약 수정',
//   tags: ['Reservation'],
//   schema: 'requests/web/reservations/PutWorkoutsWithId',
//   responses: {
//     200: {description: 'success'}
//   },
//   handler: ctrl.putReservationsWithId
// })
//
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

export {postReservations}

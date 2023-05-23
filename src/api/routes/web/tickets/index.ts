import {ApiRouter} from '../../default'
import * as ctrl from './tickets-ctrl'

const postTickets = new ApiRouter({
  name: '',
  method: 'post',
  summary: '수강권 생성',
  tags: ['Ticket'],
  schema: 'requests/web/tickets/PostTickets',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postTickets
})

const getTickets = new ApiRouter({
  name: '',
  method: 'get',
  summary: '수강권 목록',
  tags: ['Ticket'],
  schema: 'requests/web/tickets/GetTickets',
  responses: {
    200: {schema: 'responses/web/tickets/GetTickets'}
  },
  handler: ctrl.getTickets
})

// const getWorkoutsWithId = new ApiRouter({
//   name: ':id',
//   method: 'get',
//   paths: ['common/IdPath'],
//   summary: 'workout 상세',
//   tags: ['Workout'],
//   responses: {
//     200: {schema: 'responses/web/workouts/GetWorkoutsWithId'},
//     404: {description: 'not_found'}
//   },
//   handler: ctrl.getWorkoutsWithId
// })
//
// const putWorkoutsWithId = new ApiRouter({
//   name: ':id',
//   method: 'put',
//   paths: ['common/IdPath'],
//   summary: 'workout 수정',
//   tags: ['Workout'],
//   schema: 'requests/web/workouts/PutWorkoutsWithId',
//   responses: {
//     200: {description: 'success'}
//   },
//   handler: ctrl.putWorkoutsWithId
// })

export {postTickets, getTickets}

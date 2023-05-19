import {ApiRouter} from '../../default'
import * as ctrl from './workouts-ctrl'

const postWorkouts = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'workout 생성',
  tags: ['Workout'],
  schema: 'requests/web/workouts/PostWorkouts',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postWorkouts
})

const getWorkouts = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'workout 목록',
  tags: ['Workout'],
  schema: 'requests/web/workouts/GetWorkouts',
  responses: {
    200: {schema: 'responses/web/workouts/GetWorkouts'}
  },
  handler: ctrl.getWorkouts
})

const getWorkoutsWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: 'workout 상세',
  tags: ['Workout'],
  responses: {
    200: {schema: 'responses/web/workouts/GetWorkoutsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getWorkoutsWithId
})

const putWorkoutsWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: 'workout 수정',
  tags: ['Workout'],
  schema: 'requests/web/workouts/PutWorkoutsWithId',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putWorkoutsWithId
})

export {postWorkouts, getWorkouts, getWorkoutsWithId, putWorkoutsWithId}

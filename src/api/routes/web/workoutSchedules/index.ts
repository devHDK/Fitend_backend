import {ApiRouter} from '../../default'
import * as ctrl from './workoutSchedules-ctrl'

const postWorkoutSchedules = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'workout 스케줄 생성',
  tags: ['WorkoutSchedule'],
  schema: 'requests/web/workoutSchedules/PostWorkoutSchedules',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postWorkoutSchedules
})

const getWorkoutSchedules = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'workout 스케줄',
  tags: ['WorkoutSchedule'],
  schema: 'requests/web/workoutSchedules/GetWorkoutSchedules',
  responses: {
    200: {schema: 'responses/web/workoutSchedules/GetWorkoutSchedules'}
  },
  handler: ctrl.getWorkoutSchedules
})

const getWorkoutSchedulesWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: 'workout 스케줄 상세',
  tags: ['WorkoutSchedule'],
  responses: {
    200: {schema: 'responses/web/workoutSchedules/GetWorkoutSchedulesWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getWorkoutSchedulesWithId
})

const putWorkoutSchedulesWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'put',
  summary: 'workout 스케줄 수정',
  tags: ['WorkoutSchedule'],
  schema: 'requests/web/workoutSchedules/PutWorkoutSchedulesWithId',
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed'}
  },
  handler: ctrl.putWorkoutSchedulesWithId
})

const deleteWorkoutSchedulesWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'delete',
  summary: 'workout 스케줄 삭제',
  tags: ['WorkoutSchedule'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteWorkoutSchedulesWithId
})

export {
  postWorkoutSchedules,
  getWorkoutSchedules,
  getWorkoutSchedulesWithId,
  putWorkoutSchedulesWithId,
  deleteWorkoutSchedulesWithId
}

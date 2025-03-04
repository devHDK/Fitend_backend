import {ApiRouter} from '../../default'
import * as ctrl from './workoutSchedules-ctrl'

const postWorkoutSchedulesFeedbacks = new ApiRouter({
  name: ':id/feedbacks',
  paths: ['common/IdPath'],
  method: 'post',
  summary: '오늘의 운동 평가',
  tags: ['WorkoutSchedule'],
  schema: 'requests/mobile/workoutSchedules/PostWorkoutSchedulesFeedbacks',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postWorkoutSchedulesFeedbacks
})

const getWorkoutSchedules = new ApiRouter({
  name: '',
  method: 'get',
  summary: '메인 스케줄',
  tags: ['WorkoutSchedule'],
  schema: 'requests/mobile/workoutSchedules/GetWorkoutSchedules',
  responses: {
    200: {schema: 'responses/mobile/workoutSchedules/GetWorkoutSchedules'}
  },
  handler: ctrl.getWorkoutSchedules
})

const getWorkoutSchedulesWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: '오늘의 운동',
  tags: ['WorkoutSchedule'],
  responses: {
    200: {schema: 'responses/mobile/workoutSchedules/GetWorkoutSchedulesWithId'},
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
  schema: 'requests/mobile/workoutSchedules/PutWorkoutSchedulesWithId',
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed'}
  },
  handler: ctrl.putWorkoutSchedulesWithId
})

const putWorkoutSchedulesStartWithId = new ApiRouter({
  name: ':id/start',
  paths: ['common/IdPath'],
  method: 'put',
  summary: 'workout 시작',
  tags: ['WorkoutSchedule'],
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed'}
  },
  handler: ctrl.putWorkoutSchedulesStartWithId
})

export {
  postWorkoutSchedulesFeedbacks,
  getWorkoutSchedules,
  getWorkoutSchedulesWithId,
  putWorkoutSchedulesWithId,
  putWorkoutSchedulesStartWithId
}

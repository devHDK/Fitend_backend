import {ApiRouter} from '../../default'
import * as ctrl from './workoutSchedules-ctrl'

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
    200: {schema: 'responses/mobile/workoutSchedules/GetWorkoutSchedulesWithId'}
  },
  handler: ctrl.getWorkoutSchedulesWithId
})

export {getWorkoutSchedules, getWorkoutSchedulesWithId}

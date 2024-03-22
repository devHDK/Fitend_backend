import {ApiRouter} from '../../default'
import * as ctrl from './workoutSchedules-ctrl'

const getWorkoutSchedules = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'workout 스케줄',
  tags: ['WorkoutSchedule'],
  schema: 'requests/admin/workoutSchedules/GetWorkoutSchedules',
  responses: {
    200: {schema: 'responses/admin/workoutSchedules/GetWorkoutSchedules'}
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
    200: {schema: 'responses/admin/workoutSchedules/GetWorkoutSchedulesWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getWorkoutSchedulesWithId
})

export {getWorkoutSchedules, getWorkoutSchedulesWithId}

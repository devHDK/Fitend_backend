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

export {getWorkoutSchedules}

import {ApiRouter} from '../../default'
import * as ctrl from './workoutPlans-ctrl'

const getSchedules = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: '메인 스케줄',
  tags: ['Users'],
  schema: 'requests/mobile/workoutPlans/GetWorkoutPlans',
  responses: {
    200: {descreption: 'success'}
    // {schema: 'responses/mobile/workoutPlans/GetWorkoutPlans'}
  },
  handler: ctrl.getSchedules
})

export {getSchedules}

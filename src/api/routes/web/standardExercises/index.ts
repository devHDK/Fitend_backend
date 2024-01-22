import {ApiRouter} from '../../default'
import * as ctrl from './standardExercises-ctrl'

const postStandardExercises = new ApiRouter({
  name: '',
  method: 'post',
  summary: '스탠다드 운동 생성',
  tags: ['StandardExercises'],
  schema: 'requests/web/standardExercises/PostStandardExercises',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postStandardExercises
})

export {postStandardExercises}

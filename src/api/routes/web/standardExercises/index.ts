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

const postStandardExercisesUpload = new ApiRouter({
  name: 'upload',
  method: 'post',
  contentType: 'multipart/form-data',
  fileNames: ['file'],
  summary: '스탠다드 운동 생성',
  tags: ['StandardExercises'],
  isPublic: true,
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postStandardExercisesUpload
})

export {postStandardExercises, postStandardExercisesUpload}
 
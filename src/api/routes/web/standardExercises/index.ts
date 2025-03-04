import {ApiRouter} from '../../default'
import * as ctrl from './standardExercises-ctrl'

const postStandardExercises = new ApiRouter({
  name: '',
  method: 'post',
  summary: '스탠다드 운동 생성',
  tags: ['StandardExercises'],
  roles: ['master'],
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
  summary: '스탠다드 운동 엑셀 업로드',
  tags: ['StandardExercises'],
  roles: ['master'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postStandardExercisesUpload
})

const getStandardExercises = new ApiRouter({
  name: '',
  method: 'get',
  summary: '스탠다드 운동 목록',
  tags: ['StandardExercises'],
  schema: 'requests/web/standardExercises/GetStandardExercises',
  responses: {
    200: {schema: 'responses/web/standardExercises/GetStandardExercises'}
  },
  handler: ctrl.getStandardExercises
})

const getStandardExercisesWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '스탠다드 운동 상세',
  tags: ['StandardExercises'],
  responses: {
    200: {schema: 'responses/web/standardExercises/GetStandardExercisesWithId'}
  },
  handler: ctrl.getStandardExercisesWithId
})

const putStandardExercisesWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '스탠다드 운동 수정',
  tags: ['StandardExercises'],
  roles: ['master'],
  schema: 'requests/web/standardExercises/PutStandardExercisesWithId',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putStandardExercisesWithId
})

export {
  postStandardExercises,
  postStandardExercisesUpload,
  getStandardExercises,
  getStandardExercisesWithId,
  putStandardExercisesWithId
}

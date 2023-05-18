import {ApiRouter} from '../../default'
import * as ctrl from './exercises-ctrl'

const postExercises = new ApiRouter({
  name: '',
  method: 'post',
  summary: '운동 생성',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/PostExercises',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postExercises
})

const getExercises = new ApiRouter({
  name: '',
  method: 'get',
  summary: '운동 목록',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/GetExercises',
  responses: {
    200: {schema: 'responses/web/exercises/GetExercises'}
  },
  handler: ctrl.getExercises
})

const getExercisesWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '운동 상세',
  tags: ['Exercise'],
  responses: {
    200: {schema: 'responses/web/exercises/GetExercisesWithId'}
  },
  handler: ctrl.getExercisesWithId
})

const putExercises = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '운동 수정',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/PutExercises',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putExercises
})

export {
  postExercises,
  getExercises,
  getExercisesWithId,
  putExercises
}

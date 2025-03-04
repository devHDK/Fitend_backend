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

const getExercisesTags = new ApiRouter({
  name: 'tags',
  method: 'get',
  summary: '운동 태그 검색',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/GetExercisesTags',
  responses: {
    200: {schema: 'responses/web/exercises/GetExercisesTags'}
  },
  handler: ctrl.getExercisesTags
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

const getExerciseHistoryWithId = new ApiRouter({
  name: ':id/history',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '운동 히스토리',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/GetExerciseHistoryWithId',
  responses: {
    200: {schema: 'responses/web/exercises/GetExerciseHistoryWithId'}
  },
  handler: ctrl.getExerciseHistoryWithId
})

const putExercisesWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '운동 수정',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/PutExercisesWithId',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putExercisesWithId
})

const putExercisesBookmark = new ApiRouter({
  name: ':id/bookmark',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '운동 Bookmark',
  tags: ['Exercise'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putExercisesBookmark
})

export {
  postExercises,
  getExercises,
  getExercisesTags,
  getExercisesWithId,
  getExerciseHistoryWithId,
  putExercisesWithId,
  putExercisesBookmark
}

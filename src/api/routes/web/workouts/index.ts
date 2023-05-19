import {ApiRouter} from '../../default'
import * as ctrl from './workouts-ctrl'

const postWorkouts = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'workout 생성',
  tags: ['Workout'],
  schema: 'requests/web/workouts/PostWorkouts',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postWorkouts
})

const getWorkouts = new ApiRouter({
  name: '',
  method: 'get',
  summary: '운동 목록',
  tags: ['Workout'],
  schema: 'requests/web/workouts/GetWorkouts',
  responses: {
    200: {schema: 'responses/web/workouts/GetWorkouts'}
  },
  handler: ctrl.getWorkouts
})
//
// const getExercisesWithId = new ApiRouter({
//   name: ':id',
//   method: 'get',
//   paths: ['common/IdPath'],
//   summary: '운동 상세',
//   tags: ['Exercise'],
//   responses: {
//     200: {schema: 'responses/web/exercises/GetExercisesWithId'}
//   },
//   handler: ctrl.getExercisesWithId
// })
//
// const putExercises = new ApiRouter({
//   name: ':id',
//   method: 'put',
//   paths: ['common/IdPath'],
//   summary: '운동 수정',
//   tags: ['Exercise'],
//   schema: 'requests/web/exercises/PutExercises',
//   responses: {
//     200: {description: 'success'}
//   },
//   handler: ctrl.putExercises
// })

export {
  postWorkouts,
  getWorkouts,
  // getExercisesWithId,
  // putExercises
}

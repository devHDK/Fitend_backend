import {ApiRouter} from '../../default'
import * as ctrl from './workoutsRequestDays-ctrl'

const postWorkoutsRequestDays = new ApiRouter({
  name: '',
  method: 'post',
  summary: '운동희망일자 생성',
  tags: ['WorkoutRequestDay'],
  schema: 'requests/web/workoutRequestDay/PostWorkoutsRequestDays',
  responses: {
    200: {description: 'success'},
    409: {description: 'duplicate_date'}
  },
  handler: ctrl.postWorkoutsRequestDays
})

const getWorkoutsRequestDays = new ApiRouter({
  name: '',
  method: 'get',
  summary: '운동희망일자 목록',
  tags: ['WorkoutRequestDay'],
  schema: 'requests/web/workoutRequestDay/GetWorkoutsRequestDays',
  responses: {
    200: {schema: 'responses/web/workoutRequestDay/GetWorkoutsRequestDays'}
  },
  handler: ctrl.getWorkoutsRequestDays
})

const deleteWorkoutsRequestDays = new ApiRouter({
  name: '',
  method: 'delete',
  summary: '운동희망일자 삭제',
  tags: ['WorkoutRequestDay'],
  schema: 'requests/web/workoutRequestDay/DeleteWorkoutsRequestDays',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteWorkoutsRequestDays
})

export {
  postWorkoutsRequestDays,
  getWorkoutsRequestDays,
  deleteWorkoutsRequestDays
}

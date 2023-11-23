import {ApiRouter} from '../../default'
import * as ctrl from './workoutRecords-ctrl'

const postWorkoutRecords = new ApiRouter({
  name: '',
  method: 'post',
  summary: '오늘의 운동 기록',
  tags: ['WorkoutRecord'],
  schema: 'requests/mobile/workoutRecords/PostWorkoutRecords',
  responses: {
    200: {schema: 'responses/mobile/workoutRecords/PostWorkoutRecords'},
    403: {description: 'not_allowed'},
    409: {description: 'duplicate_record'}
  },
  handler: ctrl.postWorkoutSchedulesRecords
})

const getWorkoutRecords = new ApiRouter({
  name: '',
  method: 'get',
  summary: '운동 기록 조회',
  tags: ['WorkoutRecord'],
  schema: 'requests/mobile/workoutRecords/GetWorkoutRecords',
  responses: {
    200: {schema: 'responses/mobile/workoutRecords/GetWorkoutRecords'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getWorkoutRecords
})

const getWorkoutHistoryWithExerciseId = new ApiRouter({
  name: ':id/history',
  paths: ['common/IdPath'],
  summary: '운동 히스토리 조회',
  schema: 'requests/mobile/workoutRecords/GetWorkoutHistoryWithExerciseId',
  tags: ['WorkoutRecord'],
  responses: {
    200: {schema: 'responses/mobile/workoutRecords/GetWorkoutRecordsHistoryWithExerciseId'}
  },
  handler: ctrl.getWorkoutHistoryWithExerciseId
})

export {postWorkoutRecords, getWorkoutRecords, getWorkoutHistoryWithExerciseId}

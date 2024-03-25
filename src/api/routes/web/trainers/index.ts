import {ApiRouter} from '../../default'
import * as ctrl from './trainers-ctrl'

const getTrainers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '트레이너 목록',
  tags: ['Trainer'],
  responses: {
    200: {schema: 'responses/web/trainers/GetTrainers'}
  },
  handler: ctrl.getTrainers
})

const getMe = new ApiRouter({
  name: 'getMe',
  method: 'get',
  summary: '토큰 유효성 확인용(app)',
  tags: ['Trainer'],
  responses: {
    200: {schema: 'responses/web/trainers/GetMe'}
  },
  handler: ctrl.getMe
})

const getTrainersWithId = new ApiRouter({
  name: 'detail',
  method: 'get',
  summary: '트레이너 상세 조회',
  tags: ['Trainer'],
  responses: {
    200: {schema: 'responses/web/trainers/GetTrainerDetail'}
  },
  handler: ctrl.getTrainerDetail
})

const getTrainersMeetingBoundary = new ApiRouter({
  name: ':id/meetingBoundary',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '트레이너 미팅바운더리 조회',
  tags: ['Trainer'],
  responses: {
    200: {schema: 'responses/web/trainers/GetTrainersMeetingBoundary'}
  },
  handler: ctrl.getTrainersMeetingBoundary
})

const putFCMToken = new ApiRouter({
  name: 'fcmToken',
  method: 'put',
  summary: 'fcmToken update(app)',
  schema: 'requests/web/trainers/PutFCMToken',
  tags: ['Trainer'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putFCMToken
})

const putTrainerMeetingBoundary = new ApiRouter({
  name: ':id/meetingBoundary',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '트레이너 미팅바운더리 설정',
  tags: ['Trainer'],
  schema: 'requests/web/trainers/PutTrainerMeetingBoundary',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putTrainerMeetingBoundary
})

const putTrainerDetail = new ApiRouter({
  name: 'detail',
  method: 'put',
  summary: '트레이너 프로필 수정',
  tags: ['Trainer'],
  schema: 'requests/web/trainers/PutTrainerDetail',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putTrainerDetail
})

export {
  getTrainers,
  getMe,
  getTrainersWithId,
  getTrainersMeetingBoundary,
  putFCMToken,
  putTrainerMeetingBoundary,
  putTrainerDetail
}

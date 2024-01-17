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

export {getTrainers, getTrainersMeetingBoundary, putTrainerMeetingBoundary}

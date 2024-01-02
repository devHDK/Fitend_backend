import {ApiRouter} from '../../default'
import * as ctrl from './trainers-ctrl'

const getTrainers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '트레이너 목록 조회',
  isPublic: true,
  tags: ['Trainers'],
  responses: {
    200: {schema: 'responses/mobile/trainers/GetTrainers'}
  },
  handler: ctrl.getTrainers
})

const getTrainersWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '트레이너 상세 조회',
  isPublic: true,
  tags: ['Trainers'],
  responses: {
    200: {schema: 'responses/mobile/trainers/GetTrainersWithId'}
  },
  handler: ctrl.getTrainersWithId
})

export {getTrainers, getTrainersWithId}

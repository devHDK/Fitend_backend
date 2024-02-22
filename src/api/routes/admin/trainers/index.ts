import {ApiRouter} from '../../default'
import * as ctrl from './trainers-ctrl'

const postTrainers = new ApiRouter({
  name: '',
  method: 'post',
  summary: '트레이너 생성',
  schema: 'requests/admin/trainers/PostTrainers',
  tags: ['Trainers'],
  responses: {
    200: {description: 'success'},
    409: {description: '이메일 또는 휴대폰번호 중복'}
  },
  handler: ctrl.postTrainers
})

const getTrainers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '트레이너 목록 조회',
  schema: 'requests/admin/trainers/GetTrainers',
  tags: ['Trainers'],
  responses: {
    200: {schema: 'responses/admin/trainers/GetTrainers'}
  },
  handler: ctrl.getTrainers
})

const getTrainersWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: '트레이너 상세 조회',
  tags: ['Trainers'],
  responses: {
    200: {schema: 'responses/admin/trainers/GetTrainersWithId'}
  },
  handler: ctrl.getTrainersWithId
})

const putTrainers = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '트레이너 수정',
  tags: ['Trainers'],
  schema: 'requests/admin/trainers/PutTrainers',
  responses: {
    200: {description: 'success'},
    409: {description: '이메일 중복'}
  },
  handler: ctrl.putTrainers
})

export {getTrainers, getTrainersWithId, postTrainers, putTrainers}

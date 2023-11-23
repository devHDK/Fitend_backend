import {ApiRouter} from '../../default'
import * as ctrl from './trainers-ctrl'

const getTrainersWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '트레이너 상세 조회',
  tags: ['Trainers'],
  responses: {
    200: {schema: 'responses/mobile/trainers/GetTrainersWithId'}
  },
  handler: ctrl.getTrainersWithId
})

export {getTrainersWithId}

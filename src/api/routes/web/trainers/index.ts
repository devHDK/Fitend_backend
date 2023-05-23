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

export {getTrainers}

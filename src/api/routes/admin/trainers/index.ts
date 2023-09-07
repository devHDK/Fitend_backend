import {ApiRouter} from '../../default'
import * as ctrl from './trainers-ctrl'

const getTrainers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '트레이너 목록 조회',
  schema: 'requests/admin/trainers/GetTrainers',
  roles: ['master'],
  tags: ['Trainers'],
  responses: {
    200: {schema: 'responses/admin/trainers/GetTrainers'}
  },
  handler: ctrl.getTrainers
})

export {getTrainers}

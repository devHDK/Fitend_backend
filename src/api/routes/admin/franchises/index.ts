import {ApiRouter} from '../../default'
import * as ctrl from './franchises-ctrl'

const getFranchises = new ApiRouter({
  name: '',
  method: 'get',
  summary: '프랜차이즈 목록 조회',
  tags: ['Franchises'],
  responses: {
    200: {schema: 'responses/admin/franchises/GetFranchises'}
  },
  handler: ctrl.getFranchises
})

export {getFranchises}

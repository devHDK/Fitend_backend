import {ApiRouter} from '../../default'
import * as ctrl from './dashboard-ctrl'

const getDashboardActiveUsers = new ApiRouter({
  name: 'active/users',
  method: 'get',
  summary: '대시보드 > 활성화 회원수(FC 체험/유로)',
  tags: ['Dashboard'],
  responses: {
    200: {schema: 'responses/admin/dashboard/GetDashboardActiveUsers'}
  },
  handler: ctrl.getDashboardActiveUsers
})

export {getDashboardActiveUsers}

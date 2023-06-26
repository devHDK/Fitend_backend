import {ApiRouter} from '../../default'
import * as ctrl from './dashboard-ctrl'

const getDashboardWorkoutToday = new ApiRouter({
  name: 'workout/today',
  method: 'get',
  summary: '대시보드 정보 조회',
  tags: ['Dashboard'],
  schema: 'requests/web/dashboard/GetDashboardWorkoutToday',
  responses: {
    200: {schema: 'responses/web/dashboard/GetDashboardWorkoutToday'}
  },
  handler: ctrl.getDashboardWorkoutToday
})

const getDashboardWorkoutYesterday = new ApiRouter({
  name: 'workout/yesterday',
  method: 'get',
  summary: '대시보드 정보 조회',
  tags: ['Dashboard'],
  schema: 'requests/web/dashboard/GetDashboardWorkoutYesterday',
  responses: {
    200: {schema: 'responses/web/dashboard/GetDashboardWorkoutYesterday'}
  },
  handler: ctrl.getDashboardWorkoutYesterday
})

export {getDashboardWorkoutToday, getDashboardWorkoutYesterday}

import {ApiRouter} from '../../default'
import * as ctrl from './dashboard-ctrl'

const getDashboardActiveUsers = new ApiRouter({
  name: 'active/users',
  method: 'get',
  summary: '대시보드 > 활성화 회원수(PT/FC)',
  tags: ['Dashboard'],
  responses: {
    200: {schema: 'responses/web/dashboard/GetDashboardActiveUsers'}
  },
  handler: ctrl.getDashboardActiveUsers
})

const getDashboardSessions = new ApiRouter({
  name: 'sessions',
  method: 'get',
  summary: '대시보드 > 세션(전체/이번달)',
  tags: ['Dashboard'],
  responses: {
    200: {schema: 'responses/web/dashboard/GetDashboardSessions'}
  },
  handler: ctrl.getDashboardSessions
})

const getDashboardWorkoutToday = new ApiRouter({
  name: 'workout/today',
  method: 'get',
  summary: '대시보드 > 오늘 운동한 회원 목록',
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
  summary: '대시보드 > 어제 운동 안한 회원 목록',
  tags: ['Dashboard'],
  schema: 'requests/web/dashboard/GetDashboardWorkoutYesterday',
  responses: {
    200: {schema: 'responses/web/dashboard/GetDashboardWorkoutYesterday'}
  },
  handler: ctrl.getDashboardWorkoutYesterday
})

const getDashboardWorkoutUsers = new ApiRouter({
  name: 'workout/users',
  method: 'get',
  summary: '대시보드 > workouts overview',
  tags: ['Dashboard'],
  schema: 'requests/web/dashboard/GetDashboardWorkoutUsers',
  responses: {
    200: {schema: 'responses/web/dashboard/GetDashboardWorkoutUsers'}
  },
  handler: ctrl.getDashboardWorkoutUsers
})

export {
  getDashboardActiveUsers,
  getDashboardSessions,
  getDashboardWorkoutToday,
  getDashboardWorkoutYesterday,
  getDashboardWorkoutUsers
}

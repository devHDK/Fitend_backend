import {ApiRouter} from '../../default'
import * as ctrl from './notifications-ctrl'

const getNotifications = new ApiRouter({
  name: '',
  method: 'get',
  summary: '알림 목록 조회',
  tags: ['Notification'],
  schema: 'requests/web/trainerNotifications/GetNotifications',
  responses: {
    200: {schema: 'responses/web/trainerNotifications/GetNotifications'}
  },
  handler: ctrl.getNotifications
})

const getNotificationsConfirm = new ApiRouter({
  name: 'confirm',
  method: 'get',
  summary: '안읽은 알림 여부',
  tags: ['Notification'],
  responses: {
    200: {schema: 'responses/web/trainerNotifications/GetNotificationsConfirm'}
  },
  handler: ctrl.getNotificationsConfirm
})

const putNotificationsConfirm = new ApiRouter({
  name: 'confirm',
  method: 'put',
  summary: '전체 읽음 처리',
  tags: ['Notification'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putNotificationsConfirm
})

const putNotificationsSettings = new ApiRouter({
  name: 'settings',
  method: 'put',
  summary: '알림 설정 변경',
  tags: ['Notification'],
  schema: 'requests/web/trainerNotifications/PutNotificationsSettings',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putNotificationsSettings
})

export {getNotifications, getNotificationsConfirm, putNotificationsConfirm, putNotificationsSettings}

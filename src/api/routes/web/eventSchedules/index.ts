import {ApiRouter} from '../../default'
import * as ctrl from './eventSchedules-ctrl'

const postEventSchedules = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'event 생성',
  tags: ['EventSchedule'],
  schema: 'requests/web/eventSchedules/PostEventSchedules',
  responses: {
    200: {description: 'success'},
    409: {description: 'event_duplicate'}
  },
  handler: ctrl.postEventSchedules
})

const getEventSchedules = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'event 목록',
  tags: ['EventSchedule'],
  schema: 'requests/web/eventSchedules/GetEventSchedules',
  responses: {
    200: {schema: 'responses/web/eventSchedules/GetEventSchedules'}
  },
  handler: ctrl.getEventSchedules
})

const getEventSchedulesWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: 'event 상세',
  tags: ['EventSchedule'],
  responses: {
    200: {schema: 'responses/web/eventSchedules/GetEventSchedulesWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getEventSchedulesWithId
})

const putEventSchedulesWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: 'event 수정',
  tags: ['EventSchedule'],
  schema: 'requests/web/eventSchedules/PutEventSchedulesWithId',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putEventSchedulesWithId
})

const deleteEventSchedulesWithId = new ApiRouter({
  name: ':id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: 'event 삭제',
  tags: ['EventSchedule'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteEventSchedulesWithId
})

export {
  postEventSchedules,
  getEventSchedules,
  getEventSchedulesWithId,
  putEventSchedulesWithId,
  deleteEventSchedulesWithId
}

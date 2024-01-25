import {ApiRouter} from '../../default'
import * as ctrl from './meetings-ctrl'

const postMeeting = new ApiRouter({
  name: '',
  method: 'post',
  summary: '미팅 생성 ',
  tags: ['Meeting'],
  schema: 'requests/web/meetings/PostMeeting',
  responses: {
    200: {description: 'success'},
    403: {description: 'ticket_expired'},
    409: {description: 'schedule_dupplicate'}
  },
  handler: ctrl.postMeeting
})

const getMeetings = new ApiRouter({
  name: '',
  method: 'get',
  summary: '미팅 조회',
  tags: ['Meeting'],
  schema: 'requests/web/meetings/GetMeetings',
  responses: {
    200: {schema: 'responses/web/meetings/GetMeetings'}
  },
  handler: ctrl.getMeetings
})

const getMeetingsWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '미팅 상세',
  tags: ['Meeting'],
  responses: {
    200: {schema: 'responses/web/meetings/GetMeetingsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getMeetingsWithId
})

const putMeetingsWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '미팅 수정',
  tags: ['Meeting'],
  schema: 'requests/web/meetings/PutMeetingsWithId',
  responses: {
    200: {description: 'success'},
    409: {description: 'schedule_dupplicate'}
  },
  handler: ctrl.putMeetingsWithId
})

const deleteMeetingsWithId = new ApiRouter({
  name: ':id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: '미팅 삭제',
  tags: ['Meeting'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteMeetingsWithId
})

export {postMeeting, getMeetings, getMeetingsWithId, putMeetingsWithId, deleteMeetingsWithId}

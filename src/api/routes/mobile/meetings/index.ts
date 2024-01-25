import {ApiRouter} from '../../default'
import * as ctrl from './meetings-ctrl'

const postMeeting = new ApiRouter({
  name: '',
  method: 'post',
  summary: '미팅 생성 ',
  tags: ['Meeting'],
  schema: 'requests/mobile/meetings/PostMeeting',
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
  schema: 'requests/mobile/meetings/GetMeetings',
  responses: {
    200: {schema: 'responses/mobile/meetings/GetMeetings'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getMeetings
})

export {postMeeting, getMeetings}

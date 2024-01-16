import {ApiRouter} from '../../default'
import * as ctrl from './meetings-ctrl'

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

export {getMeetings}

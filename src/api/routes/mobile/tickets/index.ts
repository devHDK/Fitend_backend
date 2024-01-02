import {ApiRouter} from '../../default'
import * as ctrl from './tickets-ctrl'

const getTickets = new ApiRouter({
  name: '',
  method: 'get',
  summary: '유효 티켓 목록',
  tags: ['Ticket'],
  responses: {
    200: {schema: 'responses/mobile/tickets/GetTickets'}
  },
  handler: ctrl.getTickets
})

export {getTickets}

import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const getUsers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '회원목록',
  tags: ['Auth'],
  schema: 'requests/web/users/GetUsers',
  responses: {
    200: {schema: 'responses/web/users/GetUsers'}
  },
  handler: ctrl.getUsers
})

export {
  getUsers
}

import {ApiRouter} from '../../default'
import * as ctrl from './exercises-ctrl'

const postExercises = new ApiRouter({
  name: '',
  method: 'post',
  summary: '운동 생성',
  tags: ['Exercise'],
  schema: 'requests/web/exercises/PostExercises',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postExercises
})

// const getUsers = new ApiRouter({
//   name: '',
//   method: 'get',
//   summary: '회원목록',
//   tags: ['User'],
//   schema: 'requests/web/users/GetUsers',
//   responses: {
//     200: {schema: 'responses/web/users/GetUsers'}
//   },
//   handler: ctrl.getUsers
// })
//
// const putUsers = new ApiRouter({
//   name: '',
//   method: 'put',
//   summary: '회원수정',
//   tags: ['User'],
//   schema: 'requests/web/users/PutUsers',
//   responses: {
//     200: {description: 'success'},
//     409: {description: '이메일 또는 휴대폰번호 중복'}
//   },
//   handler: ctrl.putUsers
// })

export {
  postExercises
}

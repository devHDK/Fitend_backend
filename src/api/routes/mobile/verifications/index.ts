import {ApiRouter} from '../../default'
import * as ctrl from './verifications-ctrl'

const postVerifications = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'OTP생성 => 문자메세지 전송',
  description: 'type - register(회원가입), reset(비밀번호 초기화), id(아이디 찾기)',
  schema: 'requests/mobile/verifications/PostVerifications',
  tags: ['Verifications'],
  isPublic: true,
  responses: {
    200: {schema: 'responses/mobile/verifications/PostVerifications'},
    403: {description: '이미 문자메시지가 전송되었습니다. 잠시후 다시 시도해주세요.'},
    404: {description: '등록된 휴대폰 번호가 아닙니다.'},
    409: {description: '이미 사용중인 휴대폰 번호입니다.'}
  },
  handler: ctrl.postVerifications
})

const postVerificationsConfirm = new ApiRouter({
  name: 'confirm',
  method: 'post',
  summary: '전송 코드 확인',
  schema: 'requests/mobile/verifications/PostVerificationConfirm',
  tags: ['Verifications'],
  isPublic: true,
  responses: {
    200: {schema: 'responses/mobile/verifications/PostVerificationConfirm'},
    401: {description: '인증시간이 만료되었습니다.'},
    403: {description: '코드가 일치하지 않습니다.'}
  },
  handler: ctrl.postVerificationsConfirm
})

export {postVerifications, postVerificationsConfirm}

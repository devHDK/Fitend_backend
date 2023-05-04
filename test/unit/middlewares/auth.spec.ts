import httpMocks from 'node-mocks-http'
import {expect} from 'chai'
import {error, auth} from '../../../src/api/middlewares'

describe('Auth middleware test', function () {
  it('User: 헤더에 JWT 인증정보가 없는 요청은, http status 401을 리턴', function () {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/temp'
    })
    const response = httpMocks.createResponse()
    auth.user([])(request, response, error.errorHandler)
    expect(response.statusCode).to.equal(401)
  })

  it('Admin: 세션이 없는 요청은 http status 401을 리턴', function () {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/temp'
    })
    const response = httpMocks.createResponse()
    auth.admin([])(request, response, error.errorHandler)
    expect(response.statusCode).to.equal(401)
  })
})

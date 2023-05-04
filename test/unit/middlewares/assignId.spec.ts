import httpMocks from 'node-mocks-http'
import {expect} from 'chai'
import sinon from 'sinon'
import {assignId as assignIdMiddleware} from '../../../src/api/middlewares'

describe('assignId middleware test', function () {
  it('req 객체에 랜덤한 ID가 할당되어야함', function () {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/users'
    })
    const mockNext = sinon.fake()
    const response = httpMocks.createResponse()
    assignIdMiddleware(request, response, mockNext)
    expect(request).to.have.property('id')
  })
})

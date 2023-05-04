import httpMocks from 'node-mocks-http'
import {expect} from 'chai'
import {error} from '../../../src/api/middlewares'

const {notFound, errorHandler} = error

describe('Error middleware test', function () {
  it('지정되지 않은 route는 http status 404를 리턴', function () {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/test'
    })
    const response = httpMocks.createResponse()
    notFound(request, response)
    expect(response.statusCode).to.be.equal(404)
  })

  it('route에서 에러를 핸들링하지 않은 경우 http status 500을 리턴', function () {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/test'
    })
    const response = httpMocks.createResponse()
    let error: any = new Error('Error 500 test')
    errorHandler(error, request, response)
    expect(response.statusCode).to.be.equal(500)

    error = new Error('Error 400 test')
    error.status = 400
    errorHandler(error, request, response)
    expect(response.statusCode).to.be.equal(400)
  })
})

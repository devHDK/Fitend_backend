import request from 'supertest'
import {expect} from 'chai'
import {express as server} from '../../../src/loaders'

class AuthRequest {
  email: string
  password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}

class AuthResponse {
  accessToken: string
  refreshToken: string

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }
}

async function login(): Promise<void> {
  expect(this.authRequest.email).to.be.a('string')
  expect(this.authRequest.password).to.be.a('string')
  const response = await request(server)
    .post('/api/mobile/auth')
    .send({
      email: this.authRequest.email,
      password: this.authRequest.password
    })
    .expect(200)
  expect(response.body).to.have.property('accessToken')
  expect(response.body).to.have.property('refreshToken')
  expect(response.body).to.have.property('user')
  this.authResponse = new AuthResponse(response.body.accessToken, response.body.refreshToken)
}

describe('로그인', function () {
  it('일반 로그인 ', async function () {
    const email = 'user@example.com'
    const password = '12341234'
    const response = await request(server)
      .post('/api/mobile/auth')
      .send({
        email,
        password
      })
      .expect(200)

    expect(response.body).to.have.property('accessToken')
    expect(response.body).to.have.property('refreshToken')
    expect(response.body).to.have.property('user')
    this.authRequest = new AuthRequest(email, password)
    this.authResponse = new AuthResponse(response.body.accessToken, response.body.refreshToken)
  })
  it('리프레쉬 토큰 발급', async function () {
    await request(server)
      .post('/api/mobile/auth/refresh')
      .send({accessToken: this.authResponse.accessToken, refreshToken: this.authResponse.refreshToken})
      .expect(201)
  })
})

export {AuthRequest, AuthResponse, login}

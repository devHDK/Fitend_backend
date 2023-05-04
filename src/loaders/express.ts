import express from 'express'
import path from 'path'
import helmet from 'helmet'
// import config from 'config'
// import session, {SessionOptions} from 'express-session'
// import redis from 'redis'
// import connectRedis from 'connect-redis'
import Agendash from 'agendash'
import {assignId, morgan} from '../api/middlewares'
import {logger} from './'
import routes from '../api/routes'
import {agenda} from '../jobs'

const app = express()

// const RedisStore = connectRedis(session)
// const redisClient = redis.createClient(config.get('redis'))
// const sess: SessionOptions = {
//   name: 'cashfi.sid',
//   secret: 'Fmi2!Jf4hnq&%(%3$%6*',
//   resave: false,
//   rolling: true,
//   saveUninitialized: false,
//   store: new RedisStore({client: redisClient}),
//   cookie: {
//     httpOnly: true,
//     sameSite: true,
//     maxAge: 60 * 60 * 2 * 1000
//   }
// }
//
// if (['development', 'production'].indexOf(process.env.NODE_ENV) > -1) {
//   sess.cookie.secure = true
// }
//
// app.use(session(sess))

app.enable('trust proxy')
app.set('etag', false)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'ejs')

app.use(assignId)
app.use(
  morgan({
    skip: (req, res) =>
      req.originalUrl.includes('/swagger') || req.originalUrl.includes('/health') || res.statusCode > 300,
    stream: logger.infoStream
  })
)
app.use(
  morgan({
    skip: (req, res) => res.statusCode < 400,
    stream: logger.errorStream
  })
)
app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({extended: false}))
app.use(helmet())

app.get('/health', (req, res) => res.status(200).end())

if (process.env.NODE_ENV !== 'test') {
  app.use('/dash', Agendash(agenda))
}

routes(app)

export default app
